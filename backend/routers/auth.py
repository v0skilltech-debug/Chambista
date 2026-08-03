from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas
from database import get_db
from core.security import get_password_hash, verify_password, create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Dependency: retorna el Usuario actual desde el JWT, o levanta 401."""
    if not authorization:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        scheme, token = authorization.split(" ")
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Token inválido")
        email: str = payload.get("sub")
        user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except (ValueError, AttributeError):
        raise HTTPException(status_code=401, detail="Token inválido")


@router.get("/me")
def get_me(current_user: models.Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario autenticado."""
    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "rol": current_user.rol,
        "apellidos": current_user.apellidos,
        "telefono": current_user.telefono,
    }


@router.post("/register", response_model=schemas.UsuarioResponse)
def register(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    db_usuario = models.Usuario(
        nombre=user.nombre,
        email=user.email,
        telefono=user.telefono,
        rol=user.rol if user.rol else "cliente",
        dni=user.dni,
        apellidos=user.apellidos,
        ciudad=user.ciudad,
        distrito_principal=user.distrito_principal,
        hashed_password=hashed_password
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


@router.post("/register_provider", response_model=schemas.UsuarioResponse)
def register_provider(data: schemas.RegistroPrestadorCompleto, db: Session = Depends(get_db)):
    # Create user first (Step 1)
    db_user = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_password = get_password_hash(data.password)
    db_usuario = models.Usuario(
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        rol="trabajador",
        dni=data.dni,
        ciudad=data.ciudad,
        distrito_principal=data.distrito_principal,
        hashed_password=hashed_password
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    # Create provider profile (Steps 2 to 6)
    perfil = models.PerfilPrestador(
        usuario_id=db_usuario.id,
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
        foto_dni_frente=data.foto_dni_frente,
        foto_dni_reverso=data.foto_dni_reverso,
        selfie=data.selfie
    )
    db.add(perfil)
    db.commit()

    return db_usuario


@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "rol": user.rol, "nombre": user.nombre}


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    return {"exists": user is not None}
