from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from core.auth_deps import get_current_user
from typing import Optional

router = APIRouter()

@router.get("/provider")
def get_provider_dashboard(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """
    Dashboard del proveedor. Requiere autenticación obligatoria del prestador.
    """
    perfil = db.query(models.PerfilPrestador).filter(models.PerfilPrestador.usuario_id == current_user.id).first()
    if current_user.rol not in ["trabajador", "independiente", "empresa", "proveedor"] and not perfil:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Este dashboard es exclusivo para proveedores de servicios."
        )

    resolved_id = current_user.id

    provider = db.query(models.Usuario).filter(models.Usuario.id == resolved_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
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
        cliente_telefono = cliente.telefono if cliente and cliente.telefono else ""
        
        item = {
            "id": b.id,
            "servicio": b.servicio or "Servicio Genérico",
            "cliente": cliente_nombre,
            "telefono": cliente_telefono,
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
