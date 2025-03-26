-- Supabaseu30c7u30fcu30bfu30d9u30fcu30b9u306eu30bbu30c3u30c8u30a2u30c3u30d7SQL

-- u756au7d44u8868u30c6u30fcu30d6u30ebu306eu4f5cu6210
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  broadcast_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('u30b3u30f3u30c6u30f3u30c4', 'u6642u5831')),
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  category VARCHAR(50),
  thumbnail_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- u30bbu30adu30e5u30eau30c6u30a3u8a2du5b9a: Row Level Security (RLS) u306eu8a2du5b9a
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- u8aadu307fu53d6u308au30ddu30eau30b7u30fc: u5168u30e6u30fcu30b6u30fcu304cu8aadu307fu53d6u308au53efu80fd
CREATE POLICY "Anyone can read programs" ON programs
  FOR SELECT USING (true);

-- u66f8u304du8fbcu307fu30ddu30eau30b7u30fc: u8a8du8a3cu6e08u307fu30e6u30fcu30b6u30fcu306eu307fu66f8u304du8fbcu307fu53efu80fd
CREATE POLICY "Authenticated users can insert programs" ON programs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- u66f4u65b0u30ddu30eau30b7u30fc: u8a8du8a3cu6e08u307fu30e6u30fcu30b6u30fcu306eu307fu66f4u65b0u53efu80fd
CREATE POLICY "Authenticated users can update programs" ON programs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- u524au9664u30ddu30eau30b7u30fc: u8a8du8a3cu6e08u307fu30e6u30fcu30b6u30fcu306eu307fu524au9664u53efu80fd
CREATE POLICY "Authenticated users can delete programs" ON programs
  FOR DELETE USING (auth.role() = 'authenticated');

-- u66f4u65b0u6642u306bu81eau52d5u3067updated_atu3092u66f4u65b0u3059u308bu30c8u30eau30acu30fc
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- u30b5u30f3u30d7u30ebu30c7u30fcu30bfu306eu633fu5165
INSERT INTO programs (title, broadcast_datetime, program_type, description, duration, category) VALUES
('AIu304cu9078u3076u4ecau9031u306eu30c8u30ecu30f3u30c9u6280u8853', '2025-03-24T10:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'u6700u65b0u306eu30c8u30ecu30f3u30c9u6280u8853u3092u89e3u8aacu3059u308bu756au7d44', 30, 'tech'),
('u6700u65b0u306eu753bu50cfu751fu6210AIu30e2u30c7u30ebu3092u6bd4u8f03', '2025-03-24T11:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'u5404u7a2eu753bu50cfu751fu6210AIu306eu6bd4u8f03u3068u4f7fu3044u65b9', 45, 'tech'),
('AIu6642u5831', '2025-03-24T12:00:00+09:00', 'u6642u5831', 'u6b63u5348u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly'),
('u5065u5eb7u3068AI', '2025-03-24T13:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'AIu3092u6d3bu7528u3057u305fu5065u5eb7u7ba1u7406u306eu65b9u6cd5', 30, 'health'),
('AIu6642u5831', '2025-03-24T14:00:00+09:00', 'u6642u5831', '14u6642u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly'),
('u30d7u30edu30b0u30e9u30dfu30f3u30b0u5165u9580', '2025-03-24T15:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'u521du5fc3u8005u5411u3051u30d7u30edu30b0u30e9u30dfu30f3u30b0u8b1bu5ea7', 60, 'education'),
('AIu6642u5831', '2025-03-24T16:00:00+09:00', 'u6642u5831', '16u6642u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly'),
('u30c7u30b8u30bfu30ebu30a2u30fcu30c8u306eu4e16u754c', '2025-03-24T17:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'AIu3092u4f7fu3063u305fu30c7u30b8u30bfu30ebu30a2u30fcu30c8u306eu4f5cu308au65b9', 30, 'art'),
('AIu6642u5831', '2025-03-24T18:00:00+09:00', 'u6642u5831', '18u6642u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly'),
('u4ecau65e5u306eu30cbu30e5u30fcu30b9u30cfu30a4u30e9u30a4u30c8', '2025-03-24T19:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'u4ecau65e5u306eu91cdu8981u30cbu30e5u30fcu30b9u3092AIu304cu89e3u8aac', 30, 'news'),
('AIu6642u5831', '2025-03-24T20:00:00+09:00', 'u6642u5831', '20u6642u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly'),
('AIu30a8u30f3u30bfu30e1u30b7u30e7u30fc', '2025-03-24T21:00:00+09:00', 'u30b3u30f3u30c6u30f3u30c4', 'AIu304cu751fu6210u3057u305fu30a8u30f3u30bfu30e1u756au7d44', 45, 'entertainment'),
('AIu6642u5831', '2025-03-24T22:00:00+09:00', 'u6642u5831', '22u6642u306eu6642u5831u3068u30cbu30e5u30fcu30b9', 5, 'hourly');
