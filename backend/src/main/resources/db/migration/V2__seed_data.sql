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
