from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter()

@router.post("/", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    # 1. Crear la reseña
    db_review = models.Review(
        booking_id=review.booking_id,
        provider_id=review.provider_id,
        cliente_id=review.cliente_id,
        rating=review.rating,
        texto=review.texto
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # 2. Recalcular el promedio del proveedor
    # En una BD de producción real esto podría ser un Trigger, pero para el MVP lo hacemos aquí
    avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.provider_id == review.provider_id).scalar()
    
    # Actualizamos el perfil del prestador si deseamos guardar la calificación allí
    # Por ahora, simplemente crearemos una notificación para el proveedor
    db_notif = models.Notification(
        user_id=review.provider_id,
        tipo="calificacion",
        titulo="Has recibido una nueva calificación",
        contenido=f"Te han calificado con {review.rating} estrellas."
    )
    db.add(db_notif)
    db.commit()

    return db_review

@router.get("/provider/{provider_id}", response_model=list[schemas.ReviewResponse])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.provider_id == provider_id).all()
