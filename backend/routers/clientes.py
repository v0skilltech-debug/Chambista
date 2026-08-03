from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from core.security import decode_access_token

router = APIRouter()

def get_current_user(token: str, db: Session):
    """Extract user from Bearer token."""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    email = payload.get("sub")
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/perfil", response_model=schemas.PerfilClienteResponse)
def crear_o_actualizar_perfil(
    perfil_data: schemas.PerfilClienteCreate,
    authorization: str = "",
    db: Session = Depends(get_db),
):
    """Create or update the client profile. Expects Authorization header as Bearer <token>."""
    # Parse token from "Bearer <token>"
    token = authorization.replace("Bearer ", "").strip() if authorization else ""
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    user = get_current_user(token, db)

    perfil = db.query(models.PerfilCliente).filter(
        models.PerfilCliente.usuario_id == user.id
    ).first()

    if perfil:
        # Update existing
        if perfil_data.ciudad is not None:
            perfil.ciudad = perfil_data.ciudad
        if perfil_data.distrito is not None:
            perfil.distrito = perfil_data.distrito
        if perfil_data.zona is not None:
            perfil.zona = perfil_data.zona
        if perfil_data.servicios_frecuentes is not None:
            perfil.servicios_frecuentes = perfil_data.servicios_frecuentes
        if perfil_data.foto_perfil is not None:
            perfil.foto_perfil = perfil_data.foto_perfil
    else:
        # Create new
        perfil = models.PerfilCliente(
            usuario_id=user.id,
            ciudad=perfil_data.ciudad,
            distrito=perfil_data.distrito,
            zona=perfil_data.zona,
            servicios_frecuentes=perfil_data.servicios_frecuentes,
            foto_perfil=perfil_data.foto_perfil,
        )
        db.add(perfil)

    db.commit()
    db.refresh(perfil)
    return perfil

@router.get("/perfil", response_model=schemas.PerfilClienteResponse)
def get_perfil(authorization: str = "", db: Session = Depends(get_db)):
    """Get the current client's profile."""
    token = authorization.replace("Bearer ", "").strip() if authorization else ""
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")
    user = get_current_user(token, db)
    perfil = db.query(models.PerfilCliente).filter(
        models.PerfilCliente.usuario_id == user.id
    ).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return perfil
