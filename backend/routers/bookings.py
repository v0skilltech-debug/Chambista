from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.post("/", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    cliente = db.query(models.Usuario).filter(models.Usuario.id == booking.cliente_id).first()
    provider = db.query(models.Usuario).filter(models.Usuario.id == booking.provider_id).first()
    
    if not cliente or not provider:
        raise HTTPException(status_code=404, detail="Cliente o Proveedor no encontrado")
        
    db_booking = models.Booking(
        cliente_id=booking.cliente_id,
        provider_id=booking.provider_id,
        servicio=booking.servicio,
        fecha=booking.fecha,
        hora=booking.hora,
        estado="nueva",
        precio_estimado=booking.precio_estimado,
        direccion=booking.direccion,
        descripcion=booking.descripcion,
        fotos=booking.fotos
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Crear notificación para el proveedor
    db_notif = models.Notification(
        user_id=booking.provider_id,
        tipo="trabajo_nuevo",
        titulo="Nueva solicitud de trabajo",
        contenido=f"Tienes una nueva solicitud para: {booking.servicio}"
    )
    db.add(db_notif)
    db.commit()
    
    return db_booking

@router.get("/", response_model=list[schemas.BookingResponse])
def get_bookings(provider_id: int = None, cliente_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Booking)
    if provider_id:
        query = query.filter(models.Booking.provider_id == provider_id)
    if cliente_id:
        query = query.filter(models.Booking.cliente_id == cliente_id)
    return query.all()

@router.patch("/{booking_id}", response_model=schemas.BookingResponse)
def update_booking_status(booking_id: int, estado: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
    estados_validos = ["nueva", "pendiente", "programada", "en camino", "iniciado", "completada", "rechazada", "cancelada"]
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail="Estado inválido")
        
    booking.estado = estado
    db.commit()
    db.refresh(booking)
    return booking

@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
    db.delete(booking)
    db.commit()
    return {"message": "Reserva eliminada"}
