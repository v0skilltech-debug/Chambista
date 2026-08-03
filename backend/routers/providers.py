from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import Optional
from core.security import decode_access_token
from pydantic import BaseModel

router = APIRouter()


class PerfilProviderUpdate(BaseModel):
    usuario_id: Optional[int] = None
    oficio_principal: Optional[str] = None
    servicios: Optional[str] = None
    experiencia_anios: Optional[str] = None
    zonas_atencion: Optional[str] = None
    dias_trabajo: Optional[str] = None
    horario_atencion: Optional[str] = None
    atiende_emergencias: Optional[bool] = False
    descripcion: Optional[str] = None
    foto_perfil: Optional[str] = None
    fotos_trabajos: Optional[str] = None
    tipo_cobro: Optional[str] = None
    precio_referencial: Optional[str] = None


def get_user_from_token(authorization: Optional[str], db: Session) -> Optional[models.Usuario]:
    if not authorization:
        return None
    try:
        scheme, token = authorization.split(" ")
        payload = decode_access_token(token)
        if not payload:
            return None
        email = payload.get("sub")
        return db.query(models.Usuario).filter(models.Usuario.email == email).first()
    except Exception:
        return None


@router.post("/perfil")
def create_or_update_perfil(
    data: PerfilProviderUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Crea o actualiza el PerfilPrestador del usuario autenticado.
    Usable desde el onboarding wizard al finalizar.
    """
    # Resolver usuario por JWT o por usuario_id en body
    user = get_user_from_token(authorization, db)
    if not user and data.usuario_id:
        user = db.query(models.Usuario).filter(models.Usuario.id == data.usuario_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="No autorizado o usuario no encontrado")

    # Actualizar rol a trabajador si era cliente
    if user.rol == "cliente":
        user.rol = "trabajador"

    # Buscar perfil existente
    perfil = db.query(models.PerfilPrestador).filter(
        models.PerfilPrestador.usuario_id == user.id
    ).first()

    if perfil:
        # Update
        if data.oficio_principal is not None: perfil.oficio_principal = data.oficio_principal
        if data.servicios is not None: perfil.servicios = data.servicios
        if data.experiencia_anios is not None: perfil.experiencia_anios = data.experiencia_anios
        if data.zonas_atencion is not None: perfil.zonas_atencion = data.zonas_atencion
        if data.dias_trabajo is not None: perfil.dias_trabajo = data.dias_trabajo
        if data.horario_atencion is not None: perfil.horario_atencion = data.horario_atencion
        if data.atiende_emergencias is not None: perfil.atiende_emergencias = data.atiende_emergencias
        if data.descripcion is not None: perfil.descripcion = data.descripcion
        if data.foto_perfil is not None: perfil.foto_perfil = data.foto_perfil
        if data.fotos_trabajos is not None: perfil.fotos_trabajos = data.fotos_trabajos
        if data.tipo_cobro is not None: perfil.tipo_cobro = data.tipo_cobro
        if data.precio_referencial is not None: perfil.precio_referencial = data.precio_referencial
    else:
        # Create
        perfil = models.PerfilPrestador(
            usuario_id=user.id,
            oficio_principal=data.oficio_principal,
            servicios=data.servicios,
            experiencia_anios=data.experiencia_anios,
            zonas_atencion=data.zonas_atencion,
            dias_trabajo=data.dias_trabajo,
            horario_atencion=data.horario_atencion,
            atiende_emergencias=data.atiende_emergencias,
            descripcion=data.descripcion,
            foto_perfil=data.foto_perfil,
            fotos_trabajos=data.fotos_trabajos,
            tipo_cobro=data.tipo_cobro,
            precio_referencial=data.precio_referencial,
        )
        db.add(perfil)

    db.commit()
    db.refresh(perfil)
    db.refresh(user)

    return {
        "message": "Perfil guardado exitosamente",
        "perfil_id": perfil.id,
        "rol": user.rol
    }


@router.post("/register")
def register_provider(
    provider_data: schemas.RegistroPrestadorCompleto,
    db: Session = Depends(get_db)
):
    user = db.query(models.Usuario).filter(models.Usuario.email == provider_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    perfil_existente = db.query(models.PerfilPrestador).filter(
        models.PerfilPrestador.usuario_id == user.id
    ).first()
    if perfil_existente:
        raise HTTPException(status_code=400, detail="Este usuario ya tiene un perfil de proveedor.")

    if user.rol == "cliente":
        user.rol = "trabajador"

    nuevo_perfil = models.PerfilPrestador(
        usuario_id=user.id,
        oficio_principal=provider_data.oficio_principal,
        servicios=provider_data.servicios,
        experiencia_anios=provider_data.experiencia_anios,
        zonas_atencion=provider_data.zonas_atencion,
        dias_trabajo=provider_data.dias_trabajo,
        horario_atencion=provider_data.horario_atencion,
        atiende_emergencias=provider_data.atiende_emergencias,
        descripcion=provider_data.descripcion,
        tipo_cobro=provider_data.tipo_cobro,
        precio_referencial=provider_data.precio_referencial
    )

    db.add(nuevo_perfil)
    db.commit()
    db.refresh(nuevo_perfil)

    return {
        "message": "Perfil de proveedor creado exitosamente",
        "perfil_id": nuevo_perfil.id,
        "nuevo_rol": user.rol
    }


@router.get("/")
def list_providers(db: Session = Depends(get_db)):
    """Lista todos los proveedores con su perfil."""
    providers = db.query(models.Usuario).join(
        models.PerfilPrestador,
        models.Usuario.id == models.PerfilPrestador.usuario_id
    ).filter(
        models.Usuario.rol.in_(["trabajador", "independiente", "empresa", "proveedor"])
    ).all()

    from sqlalchemy import func
    results = []
    for u in providers:
        avg = db.query(func.avg(models.Review.rating)).filter(
            models.Review.provider_id == u.id
        ).scalar() or 0.0
        perfil = u.perfil_prestador
        results.append({
            "id": u.id,
            "nombre": u.nombre,
            "oficio_principal": perfil.oficio_principal if perfil else None,
            "zonas_atencion": perfil.zonas_atencion if perfil else None,
            "rating": round(avg, 1),
            "foto_perfil": perfil.foto_perfil if perfil else None,
        })
    return results
