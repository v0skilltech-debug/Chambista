from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from core.security import decode_access_token
from typing import Optional

router = APIRouter()

def get_current_user_id(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[int]:
    """
    Extrae el usuario_id del token JWT si está presente.
    Si no, retorna None (modo compatibilidad para dev/tests).
    """
    if not authorization:
        return None
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            return None
        payload = decode_access_token(token)
        if not payload:
            return None
        email: str = payload.get("sub")
        if not email:
            return None
        user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
        return user.id if user else None
    except Exception:
        return None


@router.get("/provider")
def get_provider_dashboard(
    provider_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Dashboard del proveedor. Resuelve el ID en este orden:
    1. Del JWT (Authorization: Bearer <token>)
    2. Del query param ?provider_id=X  (fallback dev)
    3. Hardcoded a 1 como último recurso
    """
    # Intentar extraer del JWT
    resolved_id = None
    if authorization:
        try:
            scheme, token = authorization.split(" ")
            payload = decode_access_token(token)
            if payload:
                email = payload.get("sub")
                if email:
                    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
                    if user:
                        resolved_id = user.id
        except Exception:
            pass

    # Fallback: query param
    if not resolved_id:
        resolved_id = provider_id

    # Último fallback: usuario 1
    if not resolved_id:
        resolved_id = 1

    provider = db.query(models.Usuario).filter(models.Usuario.id == resolved_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    perfil = db.query(models.PerfilPrestador).filter(models.PerfilPrestador.usuario_id == resolved_id).first()
    
    # Obtener reservas/trabajos
    bookings = db.query(models.Booking).filter(models.Booking.provider_id == resolved_id).all()
    
    # Calcular estadísticas básicas
    ingresos_mes = sum(b.precio_estimado for b in bookings if b.estado == "completada" and b.precio_estimado)
    trabajos_pendientes = len([b for b in bookings if b.estado in ["nueva", "pendiente", "programada"]])
    nuevas_solicitudes = len([b for b in bookings if b.estado == "nueva"])
    trabajos_programados = len([b for b in bookings if b.estado == "programada"])
    
    # Formatear agenda de hoy y solicitudes
    agenda = []
    solicitudes = []
    
    for b in bookings:
        cliente = db.query(models.Usuario).filter(models.Usuario.id == b.cliente_id).first()
        cliente_nombre = f"{cliente.nombre} {cliente.apellidos or ''}".strip() if cliente else "Cliente Desconocido"
        
        item = {
            "id": b.id,
            "servicio": b.servicio or "Servicio Genérico",
            "cliente": cliente_nombre,
            "fecha": b.fecha or "Sin fecha",
            "hora": b.hora or "Sin hora",
            "estado": b.estado,
            "precioEstimado": b.precio_estimado or 0,
            "direccion": b.direccion or "Sin dirección",
            "descripcion": b.descripcion or "",
            "fotos": b.fotos.split(",") if b.fotos else []
        }
        
        solicitudes.append(item)
        if b.estado in ["programada", "en camino", "iniciado"]:
            agenda.append({
                "id": str(b.id),
                "hora": b.hora or "10:00",
                "titulo": item["servicio"],
                "tipo": "trabajo",
                "cliente": cliente_nombre,
                "distrito": item["direccion"]
            })

    # Calcular calificación promedio real
    from sqlalchemy import func
    avg_rating_result = db.query(func.avg(models.Review.rating)).filter(models.Review.provider_id == resolved_id).scalar()
    avg_rating = round(avg_rating_result, 1) if avg_rating_result else 5.0

    stats = {
        "ingresosMes": ingresos_mes,
        "variacionIngresos": 0, 
        "trabajosPendientes": trabajos_pendientes,
        "nuevasSolicitudes": nuevas_solicitudes,
        "trabajosProgramados": trabajos_programados,
        "calificacionPromedio": avg_rating,
        "tiempoRespuesta": "1h",
        "mensajesSinLeer": 0
    }

    perfil_data = {
        "id": provider.id,
        "nombre": provider.nombre,
        "nivelVerificacion": "Básico" if not perfil else ("Premium" if perfil.foto_dni_frente else "Estándar"),
        "progresoVerificacion": 30 if not perfil else (100 if perfil.foto_dni_frente else 70)
    }

    return {
        "perfil": perfil_data,
        "stats": stats,
        "agenda": agenda,
        "solicitudes": solicitudes
    }
