from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    rol: Optional[str] = "cliente"

class UsuarioCreate(UsuarioBase):
    password: str
    dni: Optional[str] = None
    apellidos: Optional[str] = None
    ciudad: Optional[str] = None
    distrito_principal: Optional[str] = None

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class RegistroPrestadorCompleto(BaseModel):
    # Step 1 happens in UsuarioCreate, but if doing it all at once:
    nombre: str
    email: EmailStr
    password: str
    telefono: str
    dni: Optional[str] = None
    ciudad: Optional[str] = None
    distrito_principal: Optional[str] = None
    
    # Step 2
    oficio_principal: Optional[str] = None
    servicios: Optional[str] = None
    experiencia_anios: Optional[str] = None
    zonas_atencion: Optional[str] = None
    
    # Step 3
    dias_trabajo: Optional[str] = None
    horario_atencion: Optional[str] = None
    atiende_emergencias: Optional[bool] = False
    
    # Step 4
    descripcion: Optional[str] = None
    foto_perfil: Optional[str] = None
    fotos_trabajos: Optional[str] = None
    
    # Step 5
    tipo_cobro: Optional[str] = None
    precio_referencial: Optional[str] = None
    
    # Step 6
    foto_dni_frente: Optional[str] = None
    foto_dni_reverso: Optional[str] = None
    selfie: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str
    nombre: str

class PerfilClienteCreate(BaseModel):
    ciudad: Optional[str] = None
    distrito: Optional[str] = None
    zona: Optional[str] = None
    servicios_frecuentes: Optional[str] = None
    foto_perfil: Optional[str] = None

class PerfilClienteResponse(BaseModel):
    id: int
    usuario_id: int
    ciudad: Optional[str] = None
    distrito: Optional[str] = None
    zona: Optional[str] = None
    servicios_frecuentes: Optional[str] = None

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    servicio: Optional[str] = None
    fecha: Optional[str] = None
    hora: Optional[str] = None
    estado: Optional[str] = "nueva"
    precio_estimado: Optional[float] = None
    direccion: Optional[str] = None
    descripcion: Optional[str] = None
    fotos: Optional[str] = None

class BookingCreate(BookingBase):
    cliente_id: int
    provider_id: int

class BookingResponse(BookingBase):
    id: int
    cliente_id: int
    provider_id: int
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: float
    texto: Optional[str] = None

class ReviewCreate(ReviewBase):
    booking_id: int
    provider_id: int
    cliente_id: int

class ReviewResponse(ReviewBase):
    id: int
    booking_id: int
    provider_id: int
    cliente_id: int

    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    oficio: Optional[str] = None
    distrito: Optional[str] = None
    precio_maximo: Optional[float] = None
    rating_minimo: Optional[float] = None
