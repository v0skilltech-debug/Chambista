from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import SessionLocal
import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Pydantic schemas ----

class MensajeOut(BaseModel):
    id: int
    remitente: str
    texto: str
    created_at: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_custom(cls, msg):
        return cls(
            id=msg.id,
            remitente=msg.remitente,
            texto=msg.texto,
            created_at=msg.created_at.isoformat() if msg.created_at else ""
        )

class ConversacionOut(BaseModel):
    id: int
    cliente_username: str
    prestador_id: str
    prestador_nombre: str
    prestador_categoria: str
    updated_at: Optional[str] = None
    ultimo_mensaje: Optional[str] = None

class ConversacionCreate(BaseModel):
    cliente_username: str
    prestador_id: str
    prestador_nombre: str
    prestador_categoria: str

class MensajeCreate(BaseModel):
    texto: str
    remitente: str  # "cliente" or "prestador"


# ---- Endpoints ----

@router.post("/conversaciones", response_model=ConversacionOut)
def crear_o_obtener_conversacion(data: ConversacionCreate, db: Session = Depends(get_db)):
    """Get existing conversation or create a new one."""
    conv = db.query(models.Conversacion).filter(
        models.Conversacion.cliente_username == data.cliente_username,
        models.Conversacion.prestador_id == data.prestador_id
    ).first()

    if not conv:
        conv = models.Conversacion(
            cliente_username=data.cliente_username,
            prestador_id=data.prestador_id,
            prestador_nombre=data.prestador_nombre,
            prestador_categoria=data.prestador_categoria,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    return ConversacionOut(
        id=conv.id,
        cliente_username=conv.cliente_username,
        prestador_id=conv.prestador_id,
        prestador_nombre=conv.prestador_nombre,
        prestador_categoria=conv.prestador_categoria,
        updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
        ultimo_mensaje=conv.mensajes[-1].texto if conv.mensajes else None
    )


@router.get("/conversaciones/{username}", response_model=List[ConversacionOut])
def listar_conversaciones(username: str, db: Session = Depends(get_db)):
    """List all conversations for a given user."""
    convs = db.query(models.Conversacion).filter(
        models.Conversacion.cliente_username == username
    ).order_by(models.Conversacion.updated_at.desc()).all()

    result = []
    for conv in convs:
        result.append(ConversacionOut(
            id=conv.id,
            cliente_username=conv.cliente_username,
            prestador_id=conv.prestador_id,
            prestador_nombre=conv.prestador_nombre,
            prestador_categoria=conv.prestador_categoria,
            updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
            ultimo_mensaje=conv.mensajes[-1].texto if conv.mensajes else None
        ))
    return result

@router.get("/conversaciones/proveedor/{provider_id}", response_model=List[ConversacionOut])
def listar_conversaciones_proveedor(provider_id: str, db: Session = Depends(get_db)):
    """List all conversations for a given provider."""
    convs = db.query(models.Conversacion).filter(
        models.Conversacion.prestador_id == provider_id
    ).order_by(models.Conversacion.updated_at.desc()).all()

    result = []
    for conv in convs:
        result.append(ConversacionOut(
            id=conv.id,
            cliente_username=conv.cliente_username,
            prestador_id=conv.prestador_id,
            prestador_nombre=conv.prestador_nombre,
            prestador_categoria=conv.prestador_categoria,
            updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
            ultimo_mensaje=conv.mensajes[-1].texto if conv.mensajes else None
        ))
    return result


@router.get("/conversaciones/{conv_id}/mensajes")
def obtener_mensajes(conv_id: int, db: Session = Depends(get_db)):
    """Get all messages for a conversation."""
    conv = db.query(models.Conversacion).filter(models.Conversacion.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    return [
        {
            "id": m.id,
            "remitente": m.remitente,
            "texto": m.texto,
            "created_at": m.created_at.isoformat() if m.created_at else ""
        }
        for m in conv.mensajes
    ]


@router.post("/conversaciones/{conv_id}/mensajes")
def enviar_mensaje(conv_id: int, data: MensajeCreate, db: Session = Depends(get_db)):
    """Send a message in a conversation."""
    conv = db.query(models.Conversacion).filter(models.Conversacion.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    msg = models.Mensaje(
        conversacion_id=conv_id,
        remitente=data.remitente,
        texto=data.texto,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "remitente": msg.remitente, "texto": msg.texto}
