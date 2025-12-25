
export const roleColors = {
  creator: '#FF8C00',   // orange untuk creator/owner
  admin: '#FF9800',     // orange untuk admin
  mentor: '#F44336',    // merah untuk mentor
  merchant: '#9C27B0',  // ungu untuk merchant
  normal: '#2196F3',    // biru untuk user normal
  system: '#FF8C00',    // orange untuk system
  own: '#2d7a4f',       // hijau tua untuk pesan sendiri
  moderator: '#FFD700', // kuning untuk moderator
};

export type UserRole = keyof typeof roleColors;
