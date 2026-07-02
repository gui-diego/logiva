INSERT INTO users (email, password_hash, role, active) VALUES
('admin@logistics.com', '$2b$10$0pfX9KIgoEZ71eRCAx5R9eJxuRk7qzuZltVSU2OQauTVoH3cEWMGG', 'ADMIN', TRUE),
('operator@logistics.com', '$2b$10$6DCogY5pexz1HVx.XjqOyuLSIZVWcf366a8XLRD0LRfOv5s7e3bzy', 'OPERATOR', TRUE);

INSERT INTO carriers (name, code, active) VALUES
('Express Brasil', 'EXBR', TRUE),
('Rápido Log', 'RPLOG', TRUE),
('TransNorte', 'TNORTE', TRUE),
('Sul Cargo', 'SCARGO', TRUE);

INSERT INTO customers (name, document, city) VALUES
('Tech Store LTDA', '12.345.678/0001-90', 'São Paulo'),
('Moda Online SA', '98.765.432/0001-10', 'Rio de Janeiro'),
('Farmácia Central', '11.222.333/0001-44', 'Belo Horizonte'),
('EletroMax', '55.666.777/0001-88', 'Curitiba'),
('Casa & Jardim', '33.444.555/0001-22', 'Porto Alegre');

INSERT INTO routes (name, region) VALUES
('Rota SP Capital', 'Sudeste'),
('Rota RJ Metro', 'Sudeste'),
('Rota MG Interior', 'Sudeste'),
('Rota Sul PR/RS', 'Sul'),
('Rota Nordeste', 'Nordeste');

INSERT INTO deliveries (tracking_code, status, estimated_delivery_at, delivered_at, origin_city, destination_city, weight_kg, carrier_id, customer_id, route_id, assigned_to_id) VALUES
('TRK001', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'São Paulo', 'São Paulo', 2.50, 1, 1, 1, 2),
('TRK002', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'São Paulo', 'Campinas', 5.00, 1, 2, 1, 2),
('TRK003', 'IN_TRANSIT', DATE_ADD(NOW(), INTERVAL 1 DAY), NULL, 'Rio de Janeiro', 'Niterói', 1.20, 2, 2, 2, 2),
('TRK004', 'OUT_FOR_DELIVERY', DATE_ADD(NOW(), INTERVAL 0 DAY), NULL, 'Belo Horizonte', 'Contagem', 3.80, 3, 3, 3, 2),
('TRK005', 'DELAYED', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 'Curitiba', 'Londrina', 8.00, 4, 4, 4, 2),
('TRK006', 'PENDING', DATE_ADD(NOW(), INTERVAL 3 DAY), NULL, 'São Paulo', 'Santos', 4.50, 1, 1, 1, 2),
('TRK007', 'PICKED_UP', DATE_ADD(NOW(), INTERVAL 2 DAY), NULL, 'Porto Alegre', 'Caxias do Sul', 6.30, 4, 5, 4, 2),
('TRK008', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 'São Paulo', 'Guarulhos', 1.00, 2, 1, 1, 2),
('TRK009', 'FAILED', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 'Rio de Janeiro', 'Petrópolis', 2.20, 2, 2, 2, 2),
('TRK010', 'IN_TRANSIT', DATE_ADD(NOW(), INTERVAL 2 DAY), NULL, 'Belo Horizonte', 'Juiz de Fora', 7.50, 3, 3, 3, 2),
('TRK011', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), 'Curitiba', 'Maringá', 3.00, 4, 4, 4, 2),
('TRK012', 'DELAYED', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, 'São Paulo', 'Ribeirão Preto', 9.00, 1, 2, 1, 2),
('TRK013', 'OUT_FOR_DELIVERY', NOW(), NULL, 'Rio de Janeiro', 'Rio de Janeiro', 0.80, 2, 2, 2, 2),
('TRK014', 'PENDING', DATE_ADD(NOW(), INTERVAL 4 DAY), NULL, 'Porto Alegre', 'Pelotas', 5.50, 4, 5, 4, 2),
('TRK015', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'São Paulo', 'Sorocaba', 2.00, 1, 1, 1, 2);

INSERT INTO delivery_status_history (delivery_id, status, changed_at, note) VALUES
(1, 'PENDING', DATE_SUB(NOW(), INTERVAL 5 DAY), 'Pedido registrado'),
(1, 'PICKED_UP', DATE_SUB(NOW(), INTERVAL 4 DAY), 'Coletado no hub SP'),
(1, 'IN_TRANSIT', DATE_SUB(NOW(), INTERVAL 3 DAY), 'Em trânsito'),
(1, 'OUT_FOR_DELIVERY', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Saiu para entrega'),
(1, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Entregue ao destinatário'),
(3, 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Pedido registrado'),
(3, 'PICKED_UP', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Coletado'),
(3, 'IN_TRANSIT', NOW(), 'Em trânsito para Niterói'),
(5, 'PENDING', DATE_SUB(NOW(), INTERVAL 4 DAY), 'Pedido registrado'),
(5, 'PICKED_UP', DATE_SUB(NOW(), INTERVAL 3 DAY), 'Coletado'),
(5, 'IN_TRANSIT', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Em trânsito'),
(5, 'DELAYED', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Atraso por condições climáticas');
