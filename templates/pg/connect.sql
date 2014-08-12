DROP DATABASE "{{database}}";
--
-- Name: {{database}}; Type: DATABASE; Schema: -; Owner: {{username}}
--

CREATE DATABASE "{{database}}" WITH TEMPLATE = template0 ENCODING = '{{encoding}}';

ALTER DATABASE "{{database}}" OWNER TO "{{username}}";

\connect {{database}}
