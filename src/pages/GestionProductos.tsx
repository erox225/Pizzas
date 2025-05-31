import React, { useState } from "react";
import { Box, Card, Typography, TextField, Switch, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { LocalDrink, LocalPizza, Edit, Delete, Add, Check, Close, ArrowBack } from "@mui/icons-material";

interface Producto {
  id: string;
  name: string;
  price: number;
  activo?: boolean;
  type: 'pizza' | 'drink';
  image?: string;
  tags?: string[];
  description?: string;
  ingredients?: string[];
}

interface Props {
  productos: Producto[];
  handleEditPrecio: (tipo: 'pizza' | 'drink', id: string, precio: number) => void;
  handleToggleProducto: (tipo: 'pizza' | 'drink', id: string, activo: boolean) => void;
  handleDeleteProducto: (tipo: 'pizza' | 'drink', id: string) => void;
  handleAddProducto: (tipo: 'pizza' | 'drink', producto: Producto) => void;
}

const GestionProductos: React.FC<GestionProductosProps> = ({ productos, handleEditPrecio, handleToggleProducto, handleDeleteProducto, handleAddProducto }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; prod: Producto | null }>({ open: false, prod: null });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; changes: any }>({ open: false, changes: null });
  const [selectedTab, setSelectedTab] = useState<'pizza' | 'drink'>('pizza');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addData, setAddData] = useState<any>({ name: '', price: '', activo: true, type: selectedTab, tags: [], description: '', ingredients: [] });
  const productosList = productos ?? [];

  // Filtrar productos según tab
  const filteredProductos = productosList.filter(p => p.type === selectedTab);

  const handleEditClick = (prod: Producto) => {
    setEditId(prod.id);
    setEditData({ ...prod });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Comparación de arrays ignorando el orden
  const arraysEqualUnordered = (a: any, b: any) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const original = editId ? productosList.find(p => p.id === editId) : null;
  const hasChanges = !!original && Object.keys(editData).some(key => {
    const valA = editData[key];
    const valB = original[key];
    if (Array.isArray(valA) && Array.isArray(valB)) {
      return !arraysEqualUnordered(valA, valB);
    }
    return JSON.stringify(valA) !== JSON.stringify(valB);
  });

  // Detecta cambios entre editData y el producto original
  const getChanges = () => {
    if (!editId) return null;
    const original = productosList.find(p => p.id === editId);
    if (!original) return null;
    const changes: any = {};
    Object.keys(editData).forEach(key => {
      const valA = editData[key];
      const valB = original[key];
      if (Array.isArray(valA) && Array.isArray(valB)) {
        if (!arraysEqualUnordered(valA, valB)) {
          changes[key] = { before: valB, after: valA };
        }
      } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        changes[key] = { before: valB, after: valA };
      }
    });
    return Object.keys(changes).length > 0 ? changes : null;
  };

  const handleEditSave = () => {
    if (!editId) return;
    if (editData.price !== undefined) handleEditPrecio(editData.type, editId, Number(editData.price));
    if (editData.activo !== undefined) handleToggleProducto(editData.type, editId, editData.activo);
    setEditId(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({});
  };

  // Confirmación antes de guardar
  const handleConfirmClick = () => {
    const changes = getChanges();
    if (changes) {
      setConfirmDialog({ open: true, changes });
    }
  };

  const handleConfirmAccept = () => {
    setConfirmDialog({ open: false, changes: null });
    handleEditSave();
  };

  const handleConfirmCancel = () => {
    setConfirmDialog({ open: false, changes: null });
  };

  return (
    <Box sx={{ padding: 0, backgroundColor: '#fdf6e3' }}>
      {/* Barra de tabs sticky */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, background: '#ffecb3', px: 0, py: 0, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 74 }}>
      <Box
        sx={{
          px: 1,
          pt: 0,
          pb: 0,
          borderRadius: 3,
          border: selectedTab === 'pizza' ? '3px solid #bf1e2d' : '3px solid transparent',
          background: selectedTab === 'pizza' ? 'rgba(191,30,45,0.8)' : 'transparent',
          color: selectedTab === 'pizza' ? '#fff' : '#7a4c2a',
          fontWeight: 'bold',
          fontSize: 26,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          boxShadow: selectedTab === 'pizza' ? 2 : 0,
          transition: 'all 0.2s',
        }}
        onClick={() => setSelectedTab('pizza')}
      >
          <span style={{ fontSize: 28, marginRight: 10 }}>🍕</span> Pizzas
        </Box>
      <Box
        sx={{
          px: 1,
          pt: 0,
          pb: 0,
          borderRadius: 3,
          border: selectedTab === 'drink' ? '3px solid #4caf50' : '3px solid transparent',
          background: selectedTab === 'drink' ? 'rgba(56,142,60,0.6)' : 'transparent',
          color: selectedTab === 'drink' ? '#fff' : '#7a4c2a',
          fontWeight: 'bold',
          fontSize: 26,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          boxShadow: selectedTab === 'drink' ? 2 : 0,
          transition: 'all 0.2s',
        }}
        onClick={() => setSelectedTab('drink')}
      >
          <span style={{ fontSize: 28, marginRight: 10 }}>🥤</span> Bebidas
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
      {filteredProductos.map((prod: Producto) => {
        const isEditing = editId === prod.id;
        // Animación y margen para el modo edición SOLO en el card editado
        const editAnimation = isEditing
          ? {
              transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
              opacity: 1,
              transform: 'scale(1.03)',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
              mt: 2,
              mb: 2,
              border: '5.5px solid #1976d2',
              margin: '10px'
            }
          : {
              transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
              opacity: 1,
              transform: 'scale(1)',
              boxShadow: 2,
              border: '5.5px solid transparent'
            };
        // Unificar ancho para pizza y bebida
        return (
          <Card key={prod.id} sx={{ minWidth: 320, maxWidth: 400, width: '100%', p: 3, borderRadius: 3, boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, background: '#fffaf0', ...editAnimation }}>
            <Box sx={{ width: 120, height: 120, mb: 2, borderRadius: 2, overflow: 'hidden', background: '#eee', alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {prod.image ? (
                <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : prod.type === 'drink' ? (
                <LocalDrink sx={{ fontSize: 64, color: '#26c6da' }} />
              ) : (
                <LocalPizza sx={{ fontSize: 64, color: '#bf1e2d' }} />
              )}
            </Box>
            {isEditing ? ( 
              <>
                <TextField label="Nombre" value={editData.name ?? ''} onChange={e => handleEditChange('name', e.target.value)} size="small" fullWidth sx={{ mb: 1 }} />
                <TextField label="Precio" type="number" value={editData.price ?? ''} onChange={e => handleEditChange('price', e.target.value)} size="small" fullWidth sx={{ mb: 1 }} />
                {/* Tags: chips/cajas seleccionables */}
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Etiquetas</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, width: '100%', py: 1, background: '#fafafa', justifyItems: 'center', alignItems: 'center' }}>
                    {['Con Gluten', 'Sin Gluten', 'Con pescado', 'Picante'].map((tag) => {
                      const isSelected = Array.isArray(editData.tags) && editData.tags.includes(tag);
                      // Colores personalizados para cada etiqueta seleccionada
                      let selectedColor = '#1976d2';
                      if (isSelected) {
                        if (tag === 'Con Gluten') selectedColor = '#a67c52'; // marrón trigo
                        if (tag === 'Sin Gluten') selectedColor = '#43a047'; // verde
                        if (tag === 'Con pescado') selectedColor = '#0288d1'; // azul
                        if (tag === 'Picante') selectedColor = '#bf1e2d'; // rojo picante
                      }
                      return (
                        <Box
                          key={tag}
                          onClick={() => {
                            if (isSelected) {
                              handleEditChange('tags', editData.tags.filter((t: string) => t !== tag));
                            } else {
                              handleEditChange('tags', [...(editData.tags || []), tag]);
                            }
                          }}
                          sx={{
                            px: 0.7,
                            py: 0.2,
                            borderRadius: 2,
                            background: isSelected ? selectedColor : '#eee',
                            color: isSelected ? '#fff' : '#333',
                            fontWeight: 'bold',
                            fontSize: 12,
                            cursor: 'pointer',
                            boxShadow: isSelected ? 2 : 0,
                            border: isSelected ? `5.5px solid ${selectedColor}` : '1px solid #eee',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            minHeight: 28,
                            width: 110,
                            maxWidth: 110,
                          }}
                        >
                          {tag === 'Picante' && <span style={{ fontSize: 18, marginRight: 4 }}>🌶️</span>}
                          {tag === 'Con pescado' && <span style={{ fontSize: 18, marginRight: 4 }}>🐟</span>}
                          {tag === 'Con Gluten' && <span style={{ fontSize: 18, marginRight: 4 }}>🌾</span>}
                          {tag === 'Sin Gluten' && <span style={{ fontSize: 18, marginRight: 4 }}>🚫🌾</span>}
                          <span>{tag}</span>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                <TextField
                  label="Descripción"
                  value={editData.description ?? ''}
                  onChange={e => handleEditChange('description', e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mb: 1 }}
                  multiline
                  minRows={3}
                  maxRows={6}
                  placeholder="Escribe aquí una descripción detallada del producto..."
                />
                {/* Ingredientes chips horizontal */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Ingredientes</Typography>
                {(() => {
                  // Ingredientes disponibles (puedes modificar este array según tu catálogo)
                  const allIngredients = [
                    'Tomate', 'Mozzarella', 'Salami picante', 'Aceituna negra', 'Cebolla', 'Jamón', 'Champiñón', 'Pimiento', 'Pollo', 'Bacon', 'Anchoa', 'Albahaca', 'Queso azul', 'Piña', 'Carne', 'Atún', 'Maíz', 'Ajo', 'Orégano', 'Espinaca'
                  ];
                  const selected = Array.isArray(editData.ingredients) ? editData.ingredients : [];
                  const handleChipClick = (ing: string) => {
                    if (selected.includes(ing)) {
                      handleEditChange('ingredients', selected.filter((i: string) => i !== ing));
                    } else {
                      handleEditChange('ingredients', [...selected, ing]);
                    }
                  };
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, overflowX: 'auto', width: '100%', mb: 1, py: 1, border: '1px solid #d1d1d1', borderRadius: 2, background: '#fafafa' }}>
                      {allIngredients.map((ing) => {
                        const isSelected = selected.includes(ing);
                        return (
                          <Box
                            key={ing}
                            onClick={() => handleChipClick(ing)}
                            sx={{
                              minWidth: 80,
                              maxWidth: 120,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              background: isSelected ? '#bf1e2d' : '#eee',
                              color: isSelected ? '#fff' : '#333',
                              fontWeight: 'bold',
                              fontSize: 13,
                              cursor: 'pointer',
                              boxShadow: isSelected ? 2 : 0,
                                border: isSelected ? '5.5px solid #bf1e2d' : '1px solid #ccc',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              userSelect: 'none',
                            }}
                          >
                            {ing === 'Tomate' && <span>🍅</span>}
                            {ing === 'Salami picante' && <span>🌶️</span>}
                            {ing === 'Aceituna negra' && <span>🍕</span>}
                            {ing === 'Mozzarella' && <span>🧀</span>}
                            {ing === 'Cebolla' && <span>🧅</span>}
                            {ing === 'Jamón' && <span>🥓</span>}
                            {ing === 'Champiñón' && <span>🍄</span>}
                            {ing === 'Pimiento' && <span>🌶️</span>}
                            {ing === 'Pollo' && <span>🍗</span>}
                            {ing === 'Bacon' && <span>🥓</span>}
                            {ing === 'Anchoa' && <span>🐟</span>}
                            {ing === 'Albahaca' && <span>🌿</span>}
                            {ing === 'Queso azul' && <span>🧀</span>}
                            {ing === 'Piña' && <span>🍍</span>}
                            {ing === 'Carne' && <span>🥩</span>}
                            {ing === 'Atún' && <span>🐟</span>}
                            {ing === 'Maíz' && <span>🌽</span>}
                            {ing === 'Ajo' && <span>🧄</span>}
                            {ing === 'Orégano' && <span>🌿</span>}
                            {ing === 'Espinaca' && <span>🥬</span>}
                            <span style={{ marginLeft: 4 }}>{ing}</span>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}
                <Box sx={{ border: '1px solid #d1d1d1', borderRadius: 2, background: '#fafafa', p: 1, mb: 1, width: '95%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">Activo:</Typography>
                    <Switch checked={editData.activo ?? true} onChange={e => handleEditChange('activo', e.target.checked)} color="success" size="medium" />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#686868', mt: 1 }}>
                    *Si el producto está desactivado, inmediatamente no se venderá en la aplicación. En caso que esté activo, sí se venderá en la aplicación.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="text" color="error" startIcon={<ArrowBack />} onClick={handleEditCancel} size="large" sx={{ fontSize: 13 }}>
                    Descartar cambio
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Check />}
                    onClick={handleConfirmClick}
                    size="large"
                    sx={{ fontSize: 13 }}
                    disabled={!hasChanges}
                  >
                    Confirmar cambio
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#bf1e2d', mb: 1, fontSize: '25px' }}>{prod.name} <span style={{ color: 'black', fontWeight: 'normal', fontSize: '29px', background: 'yellow', padding: '0 14px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>{prod.price}€</span></Typography>
                {/* Etiquetas/tags */}
                {Array.isArray(prod.tags) && prod.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {prod.tags.map((tag: string) => (
                      <Box key={tag} sx={{ px: 1.5, py: 0.5, borderRadius: 2, background: tag === 'Picante' ? '#bf1e2d' : '#eee', color: tag === 'Picante' ? '#fff' : '#333', fontWeight: 'bold', fontSize: 14, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {tag === 'Picante' && <span style={{ fontSize: 18 }}>🌶️</span>}
                        {tag}
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Descripción */}
                {prod.description && (
                  <Typography variant="body2" sx={{ color: '#444', mb: 1 }}>{prod.description}</Typography>
                )}
                {/* Ingredientes */}
                {Array.isArray(prod.ingredients) && prod.ingredients.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Ingredientes:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {prod.ingredients.map((ing: string) => (
                        <Box key={ing} sx={{ px: 1.5, py: 0.5, borderRadius: 2, background: '#e0e0e0', color: '#333', fontWeight: 'bold', fontSize: 14, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {ing === 'Tomate' && <span>🍅</span>}
                          {ing === 'Salami picante' && <span>🌶️</span>}
                          {ing === 'Aceituna negra' && <span>🍕</span>}
                          {ing === 'Mozzarella' && <span>🧀</span>}
                          {ing === 'Cebolla' && <span>🧅</span>}
                          {ing}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2, alignSelf: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{
                        display: 'block',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: (prod.activo ?? true) ? '#388e3c' : '#d32f2f',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                        marginBottom: 2
                      }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: (prod.activo ?? true) ? '#388e3c' : '#d32f2f',
                          fontSize: 17,
                          letterSpacing: 1,
                          py: 0.1,
                          borderRadius: 2,
                          background: (prod.activo ?? true) ? '#e8f5e9' : '#ffebee',
                          boxShadow: 1,
                          textAlign: 'center',
                          display: 'inline-block',
                          minWidth: 'unset',
                          px: 2,
                          fontFamily: 'inherit',
                          fontWeight: 700
                        }}
                      >
                        {(prod.activo ?? true) ? 'ACTIVO' : 'INACTIVO'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 40, mx: 1, borderRight: '2px solid #e0e0e0' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton size="large" onClick={() => handleEditClick(prod)}><Edit sx={{ fontSize: 32 }} /></IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>Editar</Typography>
                  </Box>
                  <Box sx={{ height: 40, mx: 1, borderRight: '2px solid #e0e0e0' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton size="large" onClick={() => setDeleteDialog({ open: true, prod })}><Delete sx={{ fontSize: 32 }} /></IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>Eliminar</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Card>
        );
      })}
      {selectedTab === 'pizza' && (
        <Box sx={{ position: 'fixed', right: 17, bottom: 85, zIndex: 100 }}>
          <IconButton
            onClick={() => {
              setAddData({ name: '', price: '', activo: true, type: 'pizza', tags: [], description: '', ingredients: [] });
              setAddSheetOpen(true);
            }}
            sx={{
              width: 68,
              height: 68,
              background: '#bf1e2d',
              color: '#fff',
              boxShadow: '0 4px 16px #bf1e2d33',
              borderRadius: '50%',
              border: '3px solid #bf1e2d',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              position: 'relative',
              transition: 'background 0.2s',
              '&:hover': { background: '#a51a26' }
            }}
          >
            <span style={{ fontSize: 38 }}>🍕</span>
            <Box sx={{
              position: 'absolute',
              top: '12px',
              left: '8px',
              zIndex: 2,
              background: 'rgb(71,71,71)',
              borderRadius: '50%',
              width: '21px',
              height: '21px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Add sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
          </IconButton>
        </Box>
      )}
      {selectedTab === 'drink' && (
        <Box sx={{ position: 'fixed', right: 17, bottom: 85, zIndex: 100 }}>
          <IconButton
            onClick={() => {
              setAddData({ name: '', price: '', activo: true, type: 'drink', tags: [], description: '', ingredients: [] });
              setAddSheetOpen(true);
            }}
            sx={{
              width: 68,
              height: 68,
              background: '#43a047',
              color: '#fff',
              boxShadow: '0 4px 16px #43a04733',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              position: 'relative',
              transition: 'background 0.2s',
              '&:hover': { background: '#388e3c' }
            }}
          >
            <span style={{ fontSize: 38 }}>🥤</span>
            <Box sx={{
              position: 'absolute',
              top: '12px',
              left: '8px',
              zIndex: 2,
              background: 'rgb(71,71,71)',
              borderRadius: '50%',
              width: '21px',
              height: '21px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Add sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
          </IconButton>
        </Box>
      )}
      {/* Bottom Sheet para agregar producto */}
      <Dialog
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            width: '100%',
            maxWidth: '100vw',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            top: 'auto',
            height: '90vh',
            minHeight: 420,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
            background: '#fffaf0',
            transform: addSheetOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            touchAction: 'none',
          }
        }}
        PaperProps={{ style: { borderTopLeftRadius: 18, borderTopRightRadius: 18, minHeight: 420, height: '90vh', background: '#fffaf0', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)', touchAction: 'none' } }}
      >
        <Box sx={{ px: 3, pt: 2, pb: 2 }}>
          {/* Handle visual y lógica para arrastrar el Bottom Sheet */}
          <Box
            sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, cursor: 'grab' }}
            onPointerDown={e => {
              const sheet = document.querySelector('.MuiDialog-paper');
              if (!sheet) return;
              let startY = e.clientY;
              let currentY = startY;
              let dragging = true;
              sheet.style.transition = 'none';
              const onPointerMove = (ev: any) => {
                if (!dragging) return;
                currentY = ev.clientY;
                const delta = Math.max(currentY - startY, 0);
                sheet.style.transform = `translateY(${delta}px)`;
              };
              const onPointerUp = () => {
                dragging = false;
                sheet.style.transition = 'transform 0.35s cubic-bezier(.4,0,.2,1)';
                if (currentY - startY > 120) {
                  sheet.style.transform = 'translateY(100%)';
                  setTimeout(() => setAddSheetOpen(false), 200);
                } else {
                  sheet.style.transform = 'translateY(0)';
                }
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
              };
              window.addEventListener('pointermove', onPointerMove);
              window.addEventListener('pointerup', onPointerUp);
            }}
          >
            <Box sx={{ width: 48, height: 6, borderRadius: 3, background: '#d1d1d1', mt: 1, mb: 1 }} />
          </Box>
          {/* Título del formulario */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: addData.type === 'pizza' ? '#bf1e2d' : '#43a047', fontSize: 22 }}>
                {addData.type === 'pizza' ? 'Agregar Pizza' : 'Agregar Bebida'}
              </Typography>
              <span style={{ fontSize: 28 }}>
                {addData.type === 'pizza' ? '🍕' : '🥤'}
              </span>
            </Box>
          </Box>
          {/* Separador horizontal debajo del título */}
          <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
            <hr style={{ border: 'none', borderTop: '2px solid #e0e0e0', margin: 0 }} />
          </Box>
          <Typography variant="caption" sx={{ color: '#d32f2f', mb: 0.5, ml: 0.5 }}>* Campo obligatorio</Typography>
          <TextField label="Nombre" value={addData.name} onChange={e => setAddData((prev: any) => ({ ...prev, name: e.target.value }))} size="small" fullWidth sx={{ mb: 2 }} />
          <Typography variant="caption" sx={{ color: '#d32f2f', mb: 0.5, ml: 0.5 }}>* Campo obligatorio</Typography>
          <TextField label="Precio" type="number" value={addData.price} onChange={e => setAddData((prev: any) => ({ ...prev, price: e.target.value }))} size="small" fullWidth sx={{ mb: 2 }} />
          <TextField label="Descripción" value={addData.description} onChange={e => setAddData((prev: any) => ({ ...prev, description: e.target.value }))} size="small" fullWidth sx={{ mb: 2 }} multiline minRows={2} maxRows={5} />
          {/* Etiquetas/tags */}
          <Box sx={{ mb: 2, background: '#fdf6e3', borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Etiquetas</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto', width: '100%', py: 1 }}>
              {['Con Gluten', 'Sin Gluten', 'Con pescado', 'Picante'].map((tag) => {
                const isSelected = Array.isArray(addData.tags) && addData.tags.includes(tag);
                let selectedColor = '#1976d2';
                if (isSelected) {
                  if (tag === 'Con Gluten') selectedColor = '#a67c52';
                  if (tag === 'Sin Gluten') selectedColor = '#43a047';
                  if (tag === 'Con pescado') selectedColor = '#0288d1';
                  if (tag === 'Picante') selectedColor = '#bf1e2d';
                }
                return (
                  <Box
                    key={tag}
                    onClick={() => {
                      if (isSelected) {
                        setAddData((prev: any) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
                      } else {
                        setAddData((prev: any) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
                      }
                    }}
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 2,
                      background: isSelected ? selectedColor : '#eee',
                      color: isSelected ? '#fff' : '#333',
                      fontWeight: 'bold',
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: isSelected ? 2 : 0,
                      border: isSelected ? `3px solid ${selectedColor}` : '1px solid #eee',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      minHeight: 28,
                      width: 110,
                      maxWidth: 110,
                      flex: '0 0 auto',
                    }}
                  >
                    {tag === 'Picante' && <span style={{ fontSize: 18, marginRight: 4 }}>🌶️</span>}
                    {tag === 'Con pescado' && <span style={{ fontSize: 18, marginRight: 4 }}>🐟</span>}
                    {tag === 'Con Gluten' && <span style={{ fontSize: 18, marginRight: 4 }}>🌾</span>}
                    {tag === 'Sin Gluten' && <span style={{ fontSize: 18, marginRight: 4 }}>🚫🌾</span>}
                    <span>{tag}</span>
                  </Box>
                );
              })}
            </Box>
          </Box>
          {/* Ingredientes solo para pizza */}
          {addData.type === 'pizza' && (
            <Box sx={{ mb: 2, background: '#fdf6e3', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Ingredientes</Typography>
              <Box sx={{ height: 200, overflowY: 'auto', background: 'transparent' }}>
                {/* Categoría: Quesos */}
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#bf1e2d', mt: 1, mb: 1, textAlign: 'center' }}>Quesos</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: 'center' }}>
                  {['Mozzarella', 'Queso azul'].map((ing) => {
                    const isSelected = Array.isArray(addData.ingredients) && addData.ingredients.includes(ing);
                    const selectedColor = isSelected ? '#fbc02d' : '#eee'; // Amarillo para quesos
                    return (
                      <Box
                        key={ing}
                        onClick={() => {
                          if (isSelected) {
                            setAddData((prev: any) => ({ ...prev, ingredients: prev.ingredients.filter((i: string) => i !== ing) }));
                          } else {
                            setAddData((prev: any) => ({ ...prev, ingredients: [...(prev.ingredients || []), ing] }));
                          }
                        }}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          background: selectedColor,
                          color: isSelected ? '#fff' : '#333',
                          fontWeight: 'bold',
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: isSelected ? 2 : 0,
                          border: isSelected ? '3px solid #fbc02d' : '1px solid #ccc',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          userSelect: 'none',
                          width: '100%',
                          minWidth: 80,
                          maxWidth: 120,
                          mb: 1
                        }}
                      >
                        {ing === 'Mozzarella' && <span>🧀</span>}
                        {ing === 'Queso azul' && <span>🧀</span>}
                        <span style={{ marginLeft: 4 }}>{ing}</span>
                      </Box>
                    );
                  })}
                </Box>
                {/* Categoría: Carnes */}
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#bf1e2d', mt: 1, mb: 1, textAlign: 'center' }}>Carnes</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: 'center' }}>
                  {['Salami picante', 'Jamón', 'Pollo', 'Bacon', 'Carne', 'Atún', 'Anchoa'].map((ing) => {
                    const isSelected = Array.isArray(addData.ingredients) && addData.ingredients.includes(ing);
                    const selectedColor = isSelected ? '#d32f2f' : '#eee'; // Rojo para carnes
                    return (
                      <Box
                        key={ing}
                        onClick={() => {
                          if (isSelected) {
                            setAddData((prev: any) => ({ ...prev, ingredients: prev.ingredients.filter((i: string) => i !== ing) }));
                          } else {
                            setAddData((prev: any) => ({ ...prev, ingredients: [...(prev.ingredients || []), ing] }));
                          }
                        }}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          background: selectedColor,
                          color: isSelected ? '#fff' : '#333',
                          fontWeight: 'bold',
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: isSelected ? 2 : 0,
                          border: isSelected ? '3px solid #d32f2f' : '1px solid #ccc',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          userSelect: 'none',
                          width: '100%',
                          minWidth: 80,
                          maxWidth: 120,
                          mb: 1
                        }}
                      >
                        {ing === 'Salami picante' && <span>🌶️</span>}
                        {ing === 'Jamón' && <span>🥓</span>}
                        {ing === 'Pollo' && <span>🍗</span>}
                        {ing === 'Bacon' && <span>🥓</span>}
                        {ing === 'Carne' && <span>🥩</span>}
                        {ing === 'Atún' && <span>🐟</span>}
                        {ing === 'Anchoa' && <span>🐟</span>}
                        <span style={{ marginLeft: 4 }}>{ing}</span>
                      </Box>
                    );
                  })}
                </Box>
                {/* Categoría: Verduras y otros */}
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#bf1e2d', mt: 1, mb: 1, textAlign: 'center' }}>Verduras y otros</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  {['Tomate', 'Aceituna negra', 'Cebolla', 'Champiñón', 'Pimiento', 'Albahaca', 'Piña', 'Maíz', 'Ajo', 'Orégano', 'Espinaca'].map((ing) => {
                    const isSelected = Array.isArray(addData.ingredients) && addData.ingredients.includes(ing);
                    const selectedColor = isSelected ? '#43a047' : '#eee'; // Verde para verduras y otros
                    return (
                      <Box
                        key={ing}
                        onClick={() => {
                          if (isSelected) {
                            setAddData((prev: any) => ({ ...prev, ingredients: prev.ingredients.filter((i: string) => i !== ing) }));
                          } else {
                            setAddData((prev: any) => ({ ...prev, ingredients: [...(prev.ingredients || []), ing] }));
                          }
                        }}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 2,
                          background: selectedColor,
                          color: isSelected ? '#fff' : '#333',
                          fontWeight: 'bold',
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: isSelected ? 2 : 0,
                          border: isSelected ? '3px solid #43a047' : '1px solid #ccc',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          userSelect: 'none',
                          width: '100%',
                          minWidth: 80,
                          maxWidth: 120,
                          mb: 1
                        }}
                      >
                        {ing === 'Tomate' && <span>🍅</span>}
                        {ing === 'Aceituna negra' && <span>🍕</span>}
                        {ing === 'Cebolla' && <span>🧅</span>}
                        {ing === 'Champiñón' && <span>🍄</span>}
                        {ing === 'Pimiento' && <span>🌶️</span>}
                        {ing === 'Albahaca' && <span>🌿</span>}
                        {ing === 'Piña' && <span>🍍</span>}
                        {ing === 'Maíz' && <span>🌽</span>}
                        {ing === 'Ajo' && <span>🧄</span>}
                        {ing === 'Orégano' && <span>🌿</span>}
                        {ing === 'Espinaca' && <span>🥬</span>}
                        <span style={{ marginLeft: 4 }}>{ing}</span>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
            <Button variant="text" color="error" onClick={() => setAddSheetOpen(false)} startIcon={<ArrowBack sx={{fontSize:22}} />}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color={addData.type === 'pizza' ? 'primary' : 'success'}
              onClick={() => {
                if (addData.name && addData.price) {
                  handleAddProducto(addData.type, { ...addData, id: Date.now().toString(), price: Number(addData.price) });
                  setAddSheetOpen(false);
                }
              }}
              disabled={!addData.name || !addData.price}
              startIcon={<span style={{fontSize:22}}>➕</span>}
            >
              Agregar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, prod: null })}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0,0,0,0.08)'
          }
        }}
      >
        <Box sx={{ background: '#d32f2f', color: '#fff', px: 3, py: '8px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>⚠️</span>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>¿Eliminar producto?</Typography>
        </Box>
        <DialogContent>
          <Typography>¿Estás seguro de que quieres eliminar <b>{deleteDialog.prod?.name}</b>? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, prod: null })} color="primary">Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteDialog.prod) handleDeleteProducto(deleteDialog.prod.type, deleteDialog.prod.id);
              setDeleteDialog({ open: false, prod: null });
            }}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de confirmación de cambios */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmCancel}
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.08)' } }}
      >
        <Box sx={{ background: '#1976d2', color: '#fff', px: 3, py: '8px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 26, marginRight: 8 }}>📝</span>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>¿Confirmar cambios?</Typography>
        </Box>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>¿Estás seguro de aplicar los siguientes cambios?</Typography>
          {confirmDialog.changes && (
            <Box sx={{ mb: 2 }}>
              {Object.entries(confirmDialog.changes).map(([key, val]: any) => {
                // Formateo para mostrar sin comillas ni corchetes
                const formatValue = (v: any) => {
                  if (Array.isArray(v)) return v.join(', ');
                  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
                  if (v === null || v === undefined) return '';
                  return v;
                };
                return (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>Antes: <span>{formatValue(val.before)}</span></Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>Después: <b>{typeof val.after === 'string' ? formatValue(val.after) : <span>{formatValue(val.after)}</span>}</b></Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmCancel} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmAccept} variant="contained" sx={{ background: '#388e3c', color: '#fff', '&:hover': { background: '#2e7031' } }}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  };

export default GestionProductos;
