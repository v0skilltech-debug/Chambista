from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from database import get_db, strip_accents
import models
import schemas

router = APIRouter()

@router.post("/")
def search_providers(req: schemas.SearchRequest, db: Session = Depends(get_db)):
    """
    Endpoint optimizado para buscar proveedores de servicio en el marketplace.
    Soporta filtrado por oficio, distrito, precio máximo, rating mínimo y palabras clave (tags).
    """
    # 1. Definir subconsulta de ratings para evitar N+1 queries
    avg_rating_sub = db.query(
        models.Review.provider_id,
        func.avg(models.Review.rating).label("avg_rating"),
        func.count(models.Review.id).label("total_reviews")
    ).group_by(models.Review.provider_id).subquery()

    # 2. Query principal con JOINs
    query = db.query(
        models.Usuario, 
        models.PerfilPrestador, 
        avg_rating_sub.c.avg_rating,
        avg_rating_sub.c.total_reviews
    ).join(
        models.PerfilPrestador, 
        models.Usuario.id == models.PerfilPrestador.usuario_id
    ).outerjoin(
        avg_rating_sub, 
        models.Usuario.id == avg_rating_sub.c.provider_id
    ).filter(
        models.Usuario.rol.in_(["trabajador", "independiente", "empresa", "proveedor"])
    )

    # 3. Aplicar Filtros en Base de Datos con desacentuación y minúsculas
    if req.oficio:
        oficio_clean = strip_accents(req.oficio)
        query = query.filter(func.strip_accents(models.PerfilPrestador.oficio_principal).like(f"%{oficio_clean}%"))
        
    if req.distrito:
        distrito_clean = strip_accents(req.distrito)
        query = query.filter(func.strip_accents(models.PerfilPrestador.zonas_atencion).like(f"%{distrito_clean}%"))

    if req.rating_minimo:
        query = query.filter(avg_rating_sub.c.avg_rating >= req.rating_minimo)

    # Filtrado por tags inteligente - Opcional/Fallback si retorna 0
    results = []
    if req.tags and len(req.tags) > 0:
        tag_filters = []
        for tag in req.tags:
            if tag.strip():
                tag_clean = strip_accents(tag)
                tag_filters.append(func.strip_accents(models.PerfilPrestador.oficio_principal).like(f"%{tag_clean}%"))
                tag_filters.append(func.strip_accents(models.PerfilPrestador.descripcion).like(f"%{tag_clean}%"))
                tag_filters.append(func.strip_accents(models.PerfilPrestador.servicios).like(f"%{tag_clean}%"))
        if tag_filters:
            tagged_query = query.filter(or_(*tag_filters))
            results = tagged_query.all()
            
    # Si no hay tags o si la búsqueda con tags devolvió 0 resultados, usamos el query base por oficio/distrito
    if not results:
        results = query.all()
    
    # 4. Construcción del response y Post-Filtrado de precios (debido a que precio_referencial es String)
    final_results = []
    for user, perfil, avg_rating, total_reviews in results:
        rating_val = round(avg_rating, 1) if avg_rating is not None else 0.0
        reviews_count = total_reviews if total_reviews is not None else 0
        
        # Parsear precio para validación
        precio_val = 50.0  # fallback por defecto
        if perfil.precio_referencial:
            try:
                # Extraer números del string
                clean_price = "".join(c for c in perfil.precio_referencial if c.isdigit() or c == ".")
                if clean_price:
                    precio_val = float(clean_price)
            except ValueError:
                pass
                
        # Filtrado por precio máximo
        if req.precio_maximo and precio_val > req.precio_maximo:
            continue
            
        final_results.append({
            "id": user.id,
            "nombre": f"{user.nombre} {user.apellidos or ''}".strip(),
            "telefono": user.telefono,
            "oficios": perfil.oficio_principal or "Servicios Generales",
            "zonas_atencion": perfil.zonas_atencion or "Lima",
            "rating": rating_val,
            "reviews": reviews_count,
            "precio_desde": precio_val,
            "avatar": perfil.foto_perfil or "/placeholder.svg",
            "urgencia_atendida": "Sí" if perfil.atiende_emergencias else "No"
        })
        
    return final_results
