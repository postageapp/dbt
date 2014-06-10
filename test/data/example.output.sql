DROP DATABASE "example";
--
-- Name: example; Type: DATABASE; Schema: -; Owner: owner
--

CREATE DATABASE "example" WITH TEMPLATE = template0 ENCODING = 'UTF-8';

ALTER DATABASE "example" OWNER TO "owner";

\connect example

--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: postgis; Type: SCHEMA; Schema: -; Owner: example
--

CREATE SCHEMA postgis;


ALTER SCHEMA postgis OWNER TO "owner";

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: example
--

