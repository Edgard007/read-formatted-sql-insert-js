export const INSERT_EMPLEADOS = `
  INSERT INTO empleados (emp_id, emp_nombre, emp_edad, emp_departamento, emp_salario, emp_ult_mod_usuario, emp_ult_mod_fecha) VALUES
         (1, 'Ana Martínez', 28, 'Recursos Humanos', 3500.00, 'admin', '2024-12-02'),
         (2, 'Luis Pérez', 34, 'Ventas', 4200.00, 'admin', '2024-12-02')
`;

export const INSERT_PRODUCTOS = `
  INSERT INTO productos (prod_id, prod_nombre, prod_categoria, prod_precio, prod_stock, prod_ult_mod_usuario, prod_ult_mod_fecha) VALUES
         (101, 'Smartphone Galaxy S23', 'Electrónica', 899.99, 150, 'admin', '2024-12-02'),
         (102, 'Laptop Dell XPS 13', 'Electrónica', 1200.00, 75, 'admin', '2024-12-02')
`;

export const INSERT_ORDENES = `
  INSERT INTO ordenes (orden_id, orden_cliente_fk, orden_producto_fk, orden_fecha, orden_total, orden_ult_mod_usuario, orden_ult_mod_fecha) VALUES
         (2024, 1, 101, '2024-12-02', 899.99, 'admin', '2024-12-02')
`;

// Export all inserts as a single array
export const INSERTS = [
    INSERT_EMPLEADOS,
    INSERT_PRODUCTOS,
    INSERT_ORDENES
];
