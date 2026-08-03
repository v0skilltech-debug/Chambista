from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter()

@router.post("/")
def search_providers(req: schemas.SearchRequest, db: Session = Depends(get_db)):
    """
    Endpoint para buscar proveedores de servicio en el marketplace.
    """
    query = db.query(models.Usuario).join(models.PerfilPrestador, models.Usuario.id == models.PerfilPrestador.usuario_id).filter(
        models.Usuario.rol.in_(["trabajador", "independiente", "empresa", "proveedor"])
    )

    if req.oficio:
        # Usamos ILIKE o in_ para buscar oficios (Postgres/SQLite)
        # En SQLite LIKE no es case sensitive por defecto en strings ascii
        query = query.filter(models.PerfilPrestador.oficio_principal.like(f"%{req.oficio}%"))
        
    if req.distrito:
        query = query.filter(models.PerfilPrestador.zonas_atencion.like(f"%{req.distrito}%"))
        
    # Precio máximo y rating mínimo
    # Ya que SQLite no maneja arrays fácilmente con filtros, hacemos un filtro post-query si es complejo,
    # o mejor aún, estructuramos bien la DB. Por simplicidad, filtramos los que tengan un precio_hora aceptable
    # si usamos ese campo (asumiendo que en PerfilPrestador podríamos agregar un precio_base en el futuro).

    # Para el rating, necesitaríamos hacer un join con reviews si no lo guardamos denormalizado.
    # Dado que calculamos el rating en base a las reseñas:
    
    results = query.all()
    
    # Post-filtrado y construcción del response (para incluir calculos dinámicos como reviews avg)
    final_results = []
    for user in results:
        # Calcular rating
        avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.provider_id == user.id).scalar() or 0.0
        
        if req.rating_minimo and avg_rating < req.rating_minimo:
            continue
            
        final_results.append({
            "id": user.id,
            "nombre": user.nombre,
            "oficios": user.perfil_prestador.oficio_principal,
            "zonas_atencion": user.perfil_prestador.zonas_atencion,
            "rating": round(avg_rating, 1),
            "avatar": None # Placeholder
        })
        
    return final_results
