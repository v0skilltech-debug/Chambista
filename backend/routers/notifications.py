from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from core.security import decode_access_token
import models

router = APIRouter()


def get_user_id_from_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[int]:
    if not authorization:
        return None
    try:
        scheme, token = authorization.split(" ")
        payload = decode_access_token(token)
        if not payload:
            return None
        email = payload.get("sub")
        user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
        return user.id if user else None
    except Exception:
        return None


@router.get("/")
def get_notifications(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Obtener notificaciones del usuario autenticado."""
    resolved_id = None

    if authorization:
        try:
            scheme, token = authorization.split(" ")
            payload = decode_access_token(token)
            if payload:
                email = payload.get("sub")
                user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
                if user:
                    resolved_id = user.id
        except Exception:
            pass

    if not resolved_id:
        resolved_id = user_id

    if not resolved_id:
        return []

    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == resolved_id
    ).order_by(models.Notification.created_at.desc()).limit(20).all()

    return [
        {
            "id": n.id,
            "tipo": n.tipo,
            "titulo": n.titulo,
            "contenido": n.contenido,
            "read": n.read,
            "created_at": str(n.created_at)
        }
        for n in notifs
    ]


@router.patch("/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    """Marcar una notificación como leída."""
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    notif.read = True
    db.commit()
    return {"ok": True}


@router.patch("/mark-all-read")
def mark_all_read(
    user_id: Optional[int] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Marcar todas las notificaciones del usuario como leídas."""
    resolved_id = None
    if authorization:
        try:
            scheme, token = authorization.split(" ")
            payload = decode_access_token(token)
            if payload:
                email = payload.get("sub")
                user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
                if user:
                    resolved_id = user.id
        except Exception:
            pass
    if not resolved_id:
        resolved_id = user_id
    if not resolved_id:
        return {"ok": False, "detail": "No user identified"}

    db.query(models.Notification).filter(
        models.Notification.user_id == resolved_id,
        models.Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"ok": True}
