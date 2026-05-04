--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.address (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    street character varying NOT NULL,
    "wardCode" character varying NOT NULL,
    "userId" uuid,
    "contactName" character varying,
    "phoneNumber" character varying
);


ALTER TABLE public.address OWNER TO postgres;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.author (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.author OWNER TO postgres;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    "userId" uuid
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: contact_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    subject character varying,
    message text NOT NULL,
    status character varying DEFAULT 'new'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_message OWNER TO postgres;

--
-- Name: coupon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    discount numeric NOT NULL,
    description character varying NOT NULL,
    minimum numeric NOT NULL,
    "startDate" character varying NOT NULL,
    "expiryDate" character varying NOT NULL,
    type character varying DEFAULT 'percent'::character varying NOT NULL
);


ALTER TABLE public.coupon OWNER TO postgres;

--
-- Name: genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genre (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.genre OWNER TO postgres;

--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "orderDetails" jsonb DEFAULT '[]'::jsonb NOT NULL,
    address jsonb,
    total numeric DEFAULT '0'::numeric NOT NULL,
    shipping numeric DEFAULT '0'::numeric NOT NULL,
    discount numeric DEFAULT '0'::numeric NOT NULL,
    date character varying,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "deliveryDate" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    image character varying NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    special boolean DEFAULT false NOT NULL,
    year integer NOT NULL,
    "genreId" uuid,
    "soldCount" integer DEFAULT 0 NOT NULL,
    "deletedAt" timestamp without time zone,
    rating numeric(2,1) DEFAULT '0'::numeric NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "authorId" uuid,
    "publisherId" uuid
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    code character varying NOT NULL,
    name character varying NOT NULL,
    "shortName" character varying NOT NULL,
    type character varying NOT NULL
);


ALTER TABLE public.provinces OWNER TO postgres;

--
-- Name: publisher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publisher (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.publisher OWNER TO postgres;

--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rating smallint NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid,
    "productId" uuid
);


ALTER TABLE public.review OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    email character varying NOT NULL,
    contact bigint,
    password character varying NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    image character varying,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: wards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wards (
    code character varying NOT NULL,
    name character varying NOT NULL,
    "provinceCode" character varying NOT NULL
);


ALTER TABLE public.wards OWNER TO postgres;

--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid
);


ALTER TABLE public.wishlist OWNER TO postgres;

--
-- Name: wishlist_products_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_products_product (
    "wishlistId" uuid NOT NULL,
    "productId" uuid NOT NULL
);


ALTER TABLE public.wishlist_products_product OWNER TO postgres;

--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.address (id, street, "wardCode", "userId", "contactName", "phoneNumber") FROM stdin;
590cbbae-07da-4f30-a44a-384ee8c7e973	123 abc accc	09379	73cd2729-5b5d-4c4f-9162-97c8afca598f	\N	\N
f1d8d9ad-32a6-47a8-8714-951845b4bdc0	123 ng trãi	09253	03767770-033b-4c3f-98c7-6b858941d372	\N	\N
47b7103c-e0a1-409f-b532-a5263d45f745	tùng tùng tùng	12142	03767770-033b-4c3f-98c7-6b858941d372	abc	123123
ef7bd52a-146c-438e-ad7d-2f5c201d4616	123 abc	06463	73cd2729-5b5d-4c4f-9162-97c8afca598f	lâm	0787878787
18f16b43-861e-4b9c-8197-3dc59312d310	123 đường số 1	06280	0da696a7-6feb-4f10-b169-6bd0397f5778	a	0123
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (id, username, password, "createdAt", "updatedAt") FROM stdin;
c09de4a6-f9ee-4084-a7e7-245a55a34337	admin	$2b$10$8JtyN6z0fXR9TsaSMf5UH.eRksU6EmWx01KCVBPLvaFoFQTENaxvi	2026-04-17 21:50:15.785622	2026-04-17 21:50:15.785622
\.


--
-- Data for Name: author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.author (id, name) FROM stdin;
2b9f6f7b-0db7-4f19-80c2-986834049e21	Nguyễn Nhật Ánh
825981e6-0d7d-451e-be77-ae6716668230	Tô Hoài
47e95a77-6792-4f9f-8eec-d15bd7da9212	Nam Cao
b84ab1cd-f9e0-436f-8574-95c64f6ff2aa	Haruki Murakami
8a5d23f0-291a-4184-a347-b6f61fc2fd4a	J.K. Rowling
af464856-0e64-45b1-a869-def7c4cb3376	thanh lâm
c56a88d4-afb3-4b56-ae53-88c08703db87	nam cao
89954111-63f6-4d84-8368-765e09c4985d	Lâm
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, items, "userId") FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, title) FROM stdin;
\.


--
-- Data for Name: contact_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_message (id, name, email, subject, message, status, "createdAt") FROM stdin;
0262258d-72f6-456a-9c75-f05055f2f0ec	thanh lâm	abc@gmail.com		hello hello hello	replied	2026-04-21 15:12:59.774765
3c1cdf88-b5f0-40cd-9ab2-e9f717ac664c	4	31232@gma.com	jewr	231232132131	read	2026-04-21 15:14:07.246454
060747a5-8c3c-4d64-a64a-e232c99f1259	Lâm	a@gmail.com		2434342412123	replied	2026-04-21 15:13:45.442431
5c00667d-c411-43b7-8ad0-7fa749b5beeb	b	g@g.com	3123123	3123213123123123	replied	2026-04-21 15:13:53.579765
ea7134da-e7e6-4ff1-b9f8-719ad56e08c3	3123123	231@gmail.com		eqeqeqewqeqe	read	2026-04-21 15:15:59.576332
c6ba0b52-b2ec-4b22-9bfa-e10b19d145d3	fdfad	f@gad.com	dfaf	dsafdsafsdfsadffdsf	read	2026-04-21 15:28:41.474154
\.


--
-- Data for Name: coupon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon (id, code, discount, description, minimum, "startDate", "expiryDate", type) FROM stdin;
77e22e03-c1f1-4952-8d87-71c110e299c4	SALE132	10	giảm 10% min 100k	100000	2001-11-11	2030-12-31	percent
9524e793-c398-401a-a1be-01df57b04390	SALE50K	50000	giảm 50k tối thiểu 1000k	1000000	2026-04-20	2026-04-30	fixed
\.


--
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genre (id, name) FROM stdin;
846d96e8-bd85-40f1-94e2-0d8373da1c1a	Self-Help
e0fc99d3-97ad-4486-94f6-22deebd198fe	Văn học
c9a7d861-7a08-4301-98ef-bfd8b01918e1	Tiểu thuyết
d9406a27-e12e-4bc7-8034-8e003d0bfbee	Truyện ngắn
b886df78-48c0-4f05-ad08-0e587b7bb636	Kinh tế
9dfac958-3eb2-4044-ba45-f9664e58acb4	Quản trị lãnh đạo
0cfca9ae-ed67-45db-a054-7e8699bbe9aa	Kỹ năng sống
9f4fec95-6ac2-48f6-825f-3b7b01949158	Tâm lý học
cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	Nuôi dạy con
0c416071-edb0-4a0e-9fba-ba0d882f0a7f	Sách thiếu nhi
caa9dd8c-9c15-4eec-a31a-7a52494e2a93	Manga - Comic
78149431-de90-4e14-bd6f-c274d09d83f3	Tiểu sử hồi ký
71e88f6c-5127-4ee7-a23b-2310233c6fee	Lịch sử
d5cf4565-7d4a-4984-a31b-806d087df158	Giáo khoa
ff482523-2593-44f0-9b9f-3f8ec7105760	Ngoại ngữ
7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	Khoa học công nghệ
40a46084-f1dd-4d28-933d-c6fc107eb637	Y tế sức khỏe
d8531406-0072-4c21-85f2-bbfa584b801a	Du lịch địa lý
66af3704-4ab6-4136-b04b-0863a1b312a1	Nghệ thuật
4a9ab33e-26f1-42f3-84d1-87b31b8b9085	Triết học
60c94d60-447a-4d5c-800a-573c85d21682	Tôn giáo tâm linh
4cb8c332-8da9-448a-b116-f87e67322878	Hành động
3a87d9d8-2208-4cd1-8ea5-292048a2b075	Khoa học viễn tưởng
30d3154e-4f94-4bab-be88-f2dfc408cec2	Tình cảm
b65bb8c9-b221-4e30-a94e-677bb7159097	Bí ẩn
e97df86b-d286-4880-9729-9366f7a70111	Sinh học
9cb30b26-2caa-4c2c-9d59-48097624fbe1	Văn Học
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, "orderDetails", address, total, shipping, discount, date, status, "deliveryDate", "createdAt", "userId") FROM stdin;
5e7ff838-4129-430b-b6f9-876032dec439	[{"price": 17.69, "quantity": 1, "productId": "b58935f8-e152-46c7-935c-6ce467801dcc"}]	{"ward": "Phường Tích Lương", "street": "jfsdajfkldsfsdff", "province": "Thái Nguyên", "wardCode": "05500"}	22.69	0	0	17/4/2026	delivered	\N	2026-04-17 14:05:30.660813	73cd2729-5b5d-4c4f-9162-97c8afca598f
01da253c-62c7-4eb3-8741-6a359d9591e0	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	454005	0	0	17/4/2026	pending	\N	2026-04-17 19:32:26.011478	73cd2729-5b5d-4c4f-9162-97c8afca598f
2f34dceb-3688-4a7a-bbd4-dafc0b7e672e	[{"price": 42.22, "quantity": 1, "productId": "3e961b89-7101-4650-91cf-7ce0c86eb936"}, {"price": 47.72, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Tích Lương", "street": "jfsdajfkldsfsdff", "province": "Thái Nguyên", "wardCode": "05500"}	94.94	0	0	17/4/2026	delivered	\N	2026-04-17 14:10:42.7107	73cd2729-5b5d-4c4f-9162-97c8afca598f
d15b3b42-c8ae-42be-96a2-09500e6f014c	[{"price": 55000, "quantity": 10, "productId": "8bdbc975-e752-4ff9-8bb9-57b43b4d69f6"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	495000	0	0	17/4/2026	pending	\N	2026-04-17 20:01:28.062437	73cd2729-5b5d-4c4f-9162-97c8afca598f
2154a86f-7600-4db8-aa32-72b99e44ea56	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Nhân Hòa", "street": "123 ng trãi", "province": "Bắc Ninh", "wardCode": "09253"}	107000	0	0	18/4/2026	delivered	\N	2026-04-18 10:07:06.395882	03767770-033b-4c3f-98c7-6b858941d372
44066f56-5397-4406-8df7-a0f2324f2710	[{"price": 12000, "quantity": 1, "productId": "40d79405-7193-4141-b388-773ce5b413d0"}]	{"ward": "Xã Ân Thi", "street": "tùng tùng tùng", "province": "Hưng Yên", "wardCode": "12142"}	42000	0	0	18/4/2026	pending	\N	2026-04-18 10:21:30.653219	03767770-033b-4c3f-98c7-6b858941d372
f555aace-2fb4-4b81-8c20-642044bd47da	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Xã Ân Thi", "street": "tùng tùng tùng", "province": "Hưng Yên", "wardCode": "12142"}	567000	0	0	18/4/2026	delivered	\N	2026-04-18 14:00:18.402786	03767770-033b-4c3f-98c7-6b858941d372
69df533b-903a-4d31-942a-97db6b18d7b1	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Xã Ân Thi", "street": "tùng tùng tùng", "province": "Hưng Yên", "wardCode": "12142"}	510300	0	0	18/4/2026	pending	\N	2026-04-18 13:51:09.267762	03767770-033b-4c3f-98c7-6b858941d372
3cbe82e6-e9d0-4ba6-885d-ceabe2822d90	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:08:55.570155	73cd2729-5b5d-4c4f-9162-97c8afca598f
c887c77e-1abc-457d-8a58-cbef02e166fe	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:10:16.955633	73cd2729-5b5d-4c4f-9162-97c8afca598f
3d7a3a9c-25c3-40aa-81ec-9e9437ea4363	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:12:11.683982	73cd2729-5b5d-4c4f-9162-97c8afca598f
a8c061d2-9920-4577-b428-cc63c42819aa	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:13:12.424481	73cd2729-5b5d-4c4f-9162-97c8afca598f
26b0008f-3e68-4e3e-885e-2995f116b8f2	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	paid	\N	2026-04-18 21:16:06.074416	73cd2729-5b5d-4c4f-9162-97c8afca598f
bcfc815b-e04c-4c66-842c-af322d33c38a	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:13:30.034605	73cd2729-5b5d-4c4f-9162-97c8afca598f
b6566e62-3bc2-4000-b416-4dc46969a260	[{"price": 77000, "quantity": 1, "productId": "1919b6a3-8a5a-455b-bdaa-5179aa890ad1"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	107000	0	0	18/4/2026	pending	\N	2026-04-18 15:48:07.466372	73cd2729-5b5d-4c4f-9162-97c8afca598f
cb05b5a3-f645-4504-b005-657808c38c3e	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 15:48:20.422978	73cd2729-5b5d-4c4f-9162-97c8afca598f
99d4b300-856c-4d18-93e6-4b77a07dcf32	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 15:48:41.089445	73cd2729-5b5d-4c4f-9162-97c8afca598f
767a3e91-0695-4662-bed1-f3296a2a02d2	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 15:50:20.980042	73cd2729-5b5d-4c4f-9162-97c8afca598f
79192e5f-3489-4a62-9ed9-481f58769c42	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 15:53:53.772531	73cd2729-5b5d-4c4f-9162-97c8afca598f
3a945f4b-5413-432d-a85e-549ea98863e5	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 16:08:38.860645	73cd2729-5b5d-4c4f-9162-97c8afca598f
7d327760-9178-4e60-96c3-f2fde41e5f3d	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:54:18.070002	73cd2729-5b5d-4c4f-9162-97c8afca598f
22518577-697b-4876-b1b5-df76f6e0b0bf	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 16:10:55.574014	73cd2729-5b5d-4c4f-9162-97c8afca598f
3e0dab5c-f1f5-49f0-ad48-2a18080c7544	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 16:17:17.270998	73cd2729-5b5d-4c4f-9162-97c8afca598f
28b37aec-6a93-4969-9cdd-b6ecc45e92bf	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:33:31.389534	73cd2729-5b5d-4c4f-9162-97c8afca598f
67179978-15c8-4966-9f6a-cdea1e2e4618	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:35:35.403307	73cd2729-5b5d-4c4f-9162-97c8afca598f
3f00c8a7-890a-4301-b556-d5116bfc29d0	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:37:07.311409	73cd2729-5b5d-4c4f-9162-97c8afca598f
c7dad1f8-efd6-4be8-8533-a8a774734abb	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:38:14.452957	73cd2729-5b5d-4c4f-9162-97c8afca598f
6608396b-b4cb-4f0d-9bbe-fa9a108132e0	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:50:15.082032	73cd2729-5b5d-4c4f-9162-97c8afca598f
1dbc1e1c-30ae-4a57-87f7-a228e81f0c00	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 16:53:39.351075	73cd2729-5b5d-4c4f-9162-97c8afca598f
c6022716-e080-4a97-aa64-86d5efde2d82	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 17:02:42.497321	73cd2729-5b5d-4c4f-9162-97c8afca598f
ce302242-57ae-4420-9c5c-e58344d369a8	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 17:06:31.984162	73cd2729-5b5d-4c4f-9162-97c8afca598f
d839d211-56df-4c7a-9bb6-8380ad0283e5	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}, {"price": 78000, "quantity": 1, "productId": "589698e1-b558-4b91-ac30-558e557970cd"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	645000	0	0	18/4/2026	pending	\N	2026-04-18 17:10:43.97465	73cd2729-5b5d-4c4f-9162-97c8afca598f
3d79693f-66c1-4028-8fee-27266a1e9822	[{"price": 567000, "quantity": 1, "productId": "3ad4d6bf-13b5-453a-a318-2ee13e79ef49"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	567000	0	0	18/4/2026	pending	\N	2026-04-18 17:12:39.238411	73cd2729-5b5d-4c4f-9162-97c8afca598f
806629b9-e5cd-411a-90ee-29369c36d68d	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:12:48.213951	73cd2729-5b5d-4c4f-9162-97c8afca598f
092ab0d9-e7a9-4245-b1b8-9c2832ec8d11	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:14:20.71886	73cd2729-5b5d-4c4f-9162-97c8afca598f
b7928e1a-1040-4d25-b7ea-550820285022	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:16:11.719519	73cd2729-5b5d-4c4f-9162-97c8afca598f
2ed08baf-164e-43b2-9096-23bdb8dee8d8	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:26:57.052517	73cd2729-5b5d-4c4f-9162-97c8afca598f
57fd4432-51f1-42a5-aeb5-6fdd0a771eb0	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:55:09.593987	73cd2729-5b5d-4c4f-9162-97c8afca598f
9258edfa-a9c0-43f3-9b5d-a843f6bd90a0	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:57:42.355947	73cd2729-5b5d-4c4f-9162-97c8afca598f
1a4d7142-02b6-4e25-a0cc-8c46782fd079	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 17:58:47.042562	73cd2729-5b5d-4c4f-9162-97c8afca598f
de49f12e-f0b3-45f5-b523-4c12442d5590	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:25:19.397444	73cd2729-5b5d-4c4f-9162-97c8afca598f
af4a9f5c-96f5-4885-b63f-73af16621cef	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:34:07.031303	73cd2729-5b5d-4c4f-9162-97c8afca598f
57e73626-800d-485d-916e-7a0b8bc67d79	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:35:47.017178	73cd2729-5b5d-4c4f-9162-97c8afca598f
fcc4eaab-614f-4ac1-ace8-64e07f491d07	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:36:47.350947	73cd2729-5b5d-4c4f-9162-97c8afca598f
40843e47-88d2-4540-8fe0-ff16f0596370	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:38:37.738926	73cd2729-5b5d-4c4f-9162-97c8afca598f
4491f09f-76fd-4860-a8c4-63ef8428ee6f	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:44:52.641448	73cd2729-5b5d-4c4f-9162-97c8afca598f
e8335fe5-42be-4fa3-af57-989455aeb917	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:58:00.894357	73cd2729-5b5d-4c4f-9162-97c8afca598f
9c07c825-446a-4e96-8e5a-8e2bfee359c1	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 20:59:53.595028	73cd2729-5b5d-4c4f-9162-97c8afca598f
ceca149a-3111-46de-b98a-45b88d5dc911	[{"price": 454000, "quantity": 1, "productId": "d68b12d5-92bc-4781-92d6-2ce80fb67b33"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	484000	0	0	18/4/2026	pending	\N	2026-04-18 21:12:14.977885	73cd2729-5b5d-4c4f-9162-97c8afca598f
d654ea5f-f2b6-4bcf-b1dd-a7fe5b64f901	[{"price": "284000", "quantity": 1, "productId": "743f7135-1ce0-4a90-902d-c6ea34c8e4dd"}, {"price": "91000", "quantity": 1, "productId": "176e053b-96a2-48db-8d68-509e04e616c2"}, {"price": "204000", "quantity": 1, "productId": "34e22eca-8d67-4261-b074-b54a9b013a5f"}, {"price": "135000", "quantity": 1, "productId": "ca316100-0868-4a1c-a4b1-d936b3feff38"}]	{"ward": "Xã Chi Lăng", "street": "123 abc", "province": "Lạng Sơn", "wardCode": "06463"}	642600	0	0	21/4/2026	pending	\N	2026-04-21 09:38:42.169068	73cd2729-5b5d-4c4f-9162-97c8afca598f
d97215cb-0a1f-412f-95bc-d5a93760904f	[{"price": "204000", "quantity": 1, "productId": "34e22eca-8d67-4261-b074-b54a9b013a5f"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	213600	0	20400	21/4/2026	delivered	\N	2026-04-21 10:33:38.274656	73cd2729-5b5d-4c4f-9162-97c8afca598f
f1d26bc9-fa8e-4c8a-8f4d-016d0b8ea405	[{"price": "200000", "quantity": 1, "productId": "34e22eca-8d67-4261-b074-b54a9b013a5f"}]	{"ward": "Xã Chi Lăng", "street": "123 abc", "province": "Lạng Sơn", "wardCode": "06463"}	230000	0	0	21/4/2026	pending	\N	2026-04-21 14:33:41.710455	73cd2729-5b5d-4c4f-9162-97c8afca598f
0a475055-5c2f-4ab3-9971-d29edb744152	[{"price": "91000", "quantity": 2, "productId": "176e053b-96a2-48db-8d68-509e04e616c2"}]	{"ward": "Phường Phù Khê", "street": "123 abc accc", "province": "Bắc Ninh", "wardCode": "09379"}	193800	0	18200	21/4/2026	pending	\N	2026-04-21 14:34:32.905698	73cd2729-5b5d-4c4f-9162-97c8afca598f
b03ddef5-8e8d-4d60-a57e-40c4d10a230a	[{"price": "284000", "quantity": 1, "productId": "743f7135-1ce0-4a90-902d-c6ea34c8e4dd"}]	{"ward": "Xã Điềm He", "street": "123 đường số 1", "province": "Lạng Sơn", "wardCode": "06280"}	285600	30000	28400	21/4/2026	delivered	\N	2026-04-21 22:01:29.362803	0da696a7-6feb-4f10-b169-6bd0397f5778
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, title, image, description, price, special, year, "genreId", "soldCount", "deletedAt", rating, "reviewCount", "authorId", "publisherId") FROM stdin;
616d0f23-ed13-43a0-b617-cf49a3d96068	Súng vi trùng và thép	https://salt.tikicdn.com/ts/product/8b/b0/15/e703938f26f1049378606c86d40d3633.jpg	Danh sách sản phẩm. Súng, Vi trùng và Thép. Định mệnh của các xã hội loài người.Jared Diamond đã đặt ra cho mình nhiệm vụ giải thích tiến trình lịch sử loài người trên tất cả các châu lục trong 13.000 năm qua.	97000	t	2019	e97df86b-d286-4880-9729-9366f7a70111	1195	\N	0.0	64	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
59030d61-b6e9-4abf-acb9-1ad794c939aa	Khi hơi thở hóa thinh không	https://tiemsach.org/wp-content/uploads/2023/07/Ebook-Khi-hoi-tho-hoa-thinh-khong.jpg	Trang chủSách văn họcTiểu sử - hồi kýKHI HƠI THỞ HÓA THINH KHÔNG – Paul Kalanithi.Tựa đề: “Khi hơi thở hóa thinh không” của tác giả Paul KalanithiNội dung: Chia sẻ suy nghĩ và trải nghiệm trong những tháng cuối đời	199000	f	2018	40a46084-f1dd-4d28-933d-c6fc107eb637	1601	\N	0.0	266	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
0663250a-950b-422e-aee7-d8deb8c0d1fe	Cơ thể tự chữa lành	https://nhasachbaoanh.com/wp-content/uploads/2022/09/combo-tron-bo-6-cuon-co-the-tu-chua-lanh.jpg	... này đang lúc bận không thể ôm mấy cuốn truyện dài đọc được, tình cờ tìm được ebook (free :p) củ a nó, lại đúng ...	270000	f	2014	40a46084-f1dd-4d28-933d-c6fc107eb637	203	\N	0.0	437	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
506b02dc-a3e8-4997-bc59-15e89b4f0f7f	Tư duy nhanh và chậm	https://thuviensach.vn/img/news/2022/08/larger/537-tu-duy-nhanh-va-cham-1.jpg?v=5840	"Tư Duy Nhanh Và Chậm" giải thích cách bộ não vận hành qua hai hệ thống tư duy - nhanh trực giác và chậm lý trí. Bài viết tóm tắt nội dung, rút ra bài học cốt lõi và giúp bạn hiểu cách ứng dụng vào công việc, ra quyết định và cuộc sống hằng ngày.	201000	f	2020	9f4fec95-6ac2-48f6-825f-3b7b01949158	293	\N	0.0	385	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
63e09631-8858-425a-8427-4da3946aee80	Totto-chan bên cửa sổ	https://s3-ap-southeast-1.amazonaws.com/images.spiderum.com/sp-images/15089470d71d11ecb47a5d49df5ddacb.jpeg	Totto-chan nghĩa là "bé Totto", tên thân mật hồi nhỏ của tác giả Kuroyanagi Tetsuko. Totto-chan sinh trưởng trong một gia đình hạnh phúc, có cha là nghệ sĩ vĩ cầm, mẹ là vận động viên bóng rổ, nhà em còn nuôi con chó lớn tên Rocky.	121000	f	2014	0c416071-edb0-4a0e-9fba-ba0d882f0a7f	622	\N	0.0	312	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
af154a16-a819-42b7-a1f4-7c6fb62ae373	Hoàng tử bé	https://static-images.vnncdn.net/files/publish/2023/5/7/kim-dong-1515.jpg	3. Mục lục. 4. Tóm tắt Anne tóc đỏ ở đảo Hoàng tử Edward. 5. Đánh giá và cảm nhận. 1. Giới thiệu tác giả. Lucy Maud Montgomery (30 tháng 1 năm 1874 – 24 tháng 4 năm 1942), được biết đến rộng rãi dưới tên L.M. Montgomery.	101000	f	2024	0c416071-edb0-4a0e-9fba-ba0d882f0a7f	1077	\N	0.0	207	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
537fa19c-d422-424f-ba27-c6caaf26c33e	Kính vạn hoa	https://cf.shopee.vn/file/c62d541baa765c9de1e23786c2fee339	Bỏ qua nội dung. 88M. Đăng Ký.Với độ dài 54 tập (khổ nhỏ) hoặc 9 tập (khổ lớn), Kính vạn hoa từng được dựng thành phim truyền hình dài tập. Ba phần của bộ phim (sản xuất năm 2005, 2006, 2008) được chiếu trên kênh HTV9 Đài truyền hình TP.HCM.	214000	f	2010	0c416071-edb0-4a0e-9fba-ba0d882f0a7f	586	\N	0.0	165	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
f0aad124-49f5-4ab6-943d-be6d06122968	Cánh đồng bất tận	https://sachnoi.vip/wp-content/uploads/2023/01/canh-dong-bat-tan.jpg	Jun 2, 2025 · Luận điểm chính và các mẫu tóm tắt tác phẩm Cánh đồng bất tận ngắn gọn, đặc sắc nhất cùng với câu hỏi trắc nghiệm Quiz thú vị để hiểu hơn về nội dung tác phẩm.	90000	f	2015	0c416071-edb0-4a0e-9fba-ba0d882f0a7f	1613	\N	0.0	447	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
7db2995e-6331-4b8f-9787-deb157e39637	Nguồn gốc các loài	https://salt.tikicdn.com/ts/product/c9/94/9b/86f8da4e75cda71360f151461af491b1.jpg	Chúng tôi không chia sẻ bất kỳ thông tin phân tích ... WLAN, Bluetooth, truyền thông di động và các công nghệ khác - phá ...	176000	f	2015	e97df86b-d286-4880-9729-9366f7a70111	154	\N	0.0	408	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
6185e7cf-8215-45a9-b7f7-c15854033b41	Gen vị kỷ	https://cdn0.fahasa.com/media/catalog/product/g/e/gen_vi_ky_2_2020_06_15_17_22_53.jpg	Tóm tắt sách. Tác giả.Không cần phải giới thiệu về "Gen vị kỷ" nữa, nó là một trong những cuốn sách khoa học mang tính biểu tượng mà mọi người dường như đều đọc, giống như với cuốn "Vượn trần trụi" của Desmond Morris vậy.	277000	f	2024	e97df86b-d286-4880-9729-9366f7a70111	1982	\N	0.0	280	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
888b25e1-5625-4ffb-905a-1d80087fbd1c	Thế giới bí ẩn của các loài cây	https://photo.znews.vn/w1250/Uploaded/xpcwvovb/2023_07_07/126176218_3695395730511954_2417388481185755426_o_1000x600.jpg	* Bạn sẽ nhìn một cái cây khác đi sau khi đọc "Đời sống bí ẩn của cây" của Peter Wohlleben, cuốn sách tiết lộ những thuộc tính và hành vi đáng kinh ngạc của những gã khổng lồ trên cạn.	256000	f	2024	e97df86b-d286-4880-9729-9366f7a70111	767	\N	0.0	373	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
0042c4e5-100e-4129-9579-3a0aaae982a9	Naruto	https://down-vn.img.susercontent.com/file/sg-11134201-23010-guiqxisp5ulv81	Cốt truyện được chia làm hai phần – phần đầu lấy bối cảnh vài năm trước tuổi thiếu niên (Naruto Dattebayo) và phần thứ hai là ở tuổi thiếu niên của Naruto (Naruto Shippuden).	255000	f	2023	caa9dd8c-9c15-4eec-a31a-7a52494e2a93	51	\N	0.0	183	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
8e0d533e-063a-4b98-acee-0aaed4fb46ed	Hiệu ứng chim mồi	https://sachhay24h.com/uploads/images/hieu-ung-gia-chim-moi-review-4.jpeg	Hieu Ung Chim Moi 2 Hao Nhien Quoc Khanh.Thông tin pháp lý. Mecobooks - Vũ trụ sách cũ. Địa chỉ: số 3 đường Louis X Đại Mỗ, Nam Từ Liêm, Hà Nội. Hotline: 0899625089.	197000	t	2021	b886df78-48c0-4f05-ad08-0e587b7bb636	113	\N	5.0	264	2b9f6f7b-0db7-4f19-80c2-986834049e21	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
4167fed1-a3a4-4026-820d-0300f651acca	Harry Potter và Hòn Đá Phù Thủy	https://cf.shopee.vn/file/6fe381fdffaeb4e584a364d9d062fe8e	Và tập 1 của bộ truyện – “Harry Potter và hòn đá phù thủy” – là một lời mở đầu tuyệt vời của tác giả J. K. Rowling.	250000	f	2024	e0fc99d3-97ad-4486-94f6-22deebd198fe	12000	\N	5.0	5600	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
71770ee8-89e2-437b-90b7-bbd5c00b2b4a	Rừng Na Uy	https://307a0e78.vws.vegacdn.vn/view/v2/image/img.fm_audio_book/0/0/0/1394.jpg?v=2&w=480&h=700	Rừng Na-Uy (tiếng Nhật: ノルウェイの森, Noruwei no mori) là tiểu thuyết của nhà văn Nhật Bản Murakami Haruki, được xuất bản lần đầu năm 1987. Với thủ pháp dòng ý thức, cốt truyện diễn tiến trong dòng hồi tưởng của nhân vật chính là chàng sinh viên bình thường Watanabe ...	185000	f	2024	e0fc99d3-97ad-4486-94f6-22deebd198fe	4500	\N	4.5	1800	b84ab1cd-f9e0-436f-8574-95c64f6ff2aa	701c05ae-7f15-43da-987a-a7e8f49dbee3
986c6a1f-9470-4a73-b051-65c47c66a489	Dám bị ghét	https://data.tiasach.com/book/55/55-the-courage-to-be-disliked-bg-le5.webp	Dám bị ghét là tác phẩm tâm lý thuộc hàng kinh điển bán chạy tại Nhật Bản. Cuốn sách phân tích những cách thức điều hòa các mối quan hệ xã hội trong cuộc sống và đề cập đến những góc khuất tâm lý trong cuộc đời con người.	125000	f	2023	40a46084-f1dd-4d28-933d-c6fc107eb637	452	\N	4.1	316	47e95a77-6792-4f9f-8eec-d15bd7da9212	1eec97aa-eb80-4f10-ba91-804f1829440e
77619644-ce07-4667-b9f1-d17f02681757	Dragon Ball	https://cf.shopee.vn/file/098864d7cc515a57be56a5c442748705	Tương phản với tiểu thuyết Tây du ký của Trung Quốc, loạt truyện mô tả cuộc hành trình của Son Goku từ lúc bé đến trưởng thành, qua các lần tầm sư học võ và khám phá thế giới để truy tìm các viên ngọc rồng với điều ước từ rồng thiêng.	290000	f	2023	caa9dd8c-9c15-4eec-a31a-7a52494e2a93	379	\N	0.0	18	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b48908dc-1e49-4613-a14e-7d1ac7aba78c	Cộng hòa - Plato	https://imgv2-2-f.scribdassets.com/img/document/748548558/original/149c5c8135/1723940949?v=1	Cộng hòa (Tiếng Hy Lạp: Πολιτεία, Politeia) là cuốn sách về Socrates được Platon viết vào khoảng năm 380 TCN trả lời các câu hỏi về công lý, thành phố công lý, và cá nhân công lý. [1]	256000	f	2020	4a9ab33e-26f1-42f3-84d1-87b31b8b9085	1966	\N	0.0	199	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
47d0f356-a6d6-4116-8935-8b9d4a05cd3f	Đi tìm lẽ sống	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc3454OdTEV2Yaph2VcPTinTiEa9vQJuLOEF0OaxIHN6DoGhDYhgjDPISdExB74wFUb3U2N9sSyPkXnvAkW_A-5lMT3SedaZauO9B55w&s=10	Xin lỗi! Khi sử dựng ứng dụng thì tôi đã gặp lỗi và không thể tóm tắt được bài viết của tôi.	155000	f	2022	9f4fec95-6ac2-48f6-825f-3b7b01949158	79	\N	4.3	375	825981e6-0d7d-451e-be77-ae6716668230	701c05ae-7f15-43da-987a-a7e8f49dbee3
a109411b-12ab-4266-8e94-a3af90fccc83	Khảo luận về nhân tính	https://www.netabooks.vn/Data/Sites/1/Product/76966/tim-hieu-nhan-tinh-bia-cung.jpg	- Chuẩn bị các phương tiện để ghi chép và tóm tắt nội dung buổi thuyết trình như giấy, bút, sổ tay, máy tính cá nhân (nếu có). - Biết tóm tắt bài thuyết trình.	119000	f	2010	4a9ab33e-26f1-42f3-84d1-87b31b8b9085	143	\N	0.0	299	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
c1f2234a-6997-45de-9a5b-6a53e6870ecb	Thế giới của Sophie	https://down-vn.img.susercontent.com/file/793603710a70cd8e351a6bfa6894bc1c	Phần lớn nội dung bao gồm các đoạn đối thoại giữa nhân vật chính Sophie và một người đàn ông bí ẩn tên là Alberto Knox, đan xem với các tình tiết ngày càng bí hiểm và kỳ quặc hơn. Đây vừa là một tiểu thuyết, vừa là một hướng dẫn căn bản về triết học phương Tây.	114000	t	2021	4a9ab33e-26f1-42f3-84d1-87b31b8b9085	690	\N	0.0	374	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
0cb78efa-1478-4d3b-b013-c3243a913d24	Thám tử lừng danh Conan	https://down-vn.img.susercontent.com/file/sg-11134201-7qvfb-lhp1xpnh5akt2c	Tóm tắt nội dung truyện. Thám Tử Lừng Danh Conan là một trong những tác phẩm nổi bật, được chấp bút bởi .	105000	t	2022	9f4fec95-6ac2-48f6-825f-3b7b01949158	567	\N	4.8	230	2b9f6f7b-0db7-4f19-80c2-986834049e21	1eec97aa-eb80-4f10-ba91-804f1829440e
02c9d050-530c-46cf-b475-8eb934f8a0ab	Elon Musk	https://cdn0.fahasa.com/media/catalog/product/e/l/elonmusk_2.jpg	Elon Reeve Musk (sinh ngày 28 tháng 6 năm 1971) là một doanh nhân, nổi tiếng với vai trò mấu chốt trong hai công ty Tesla, Inc. và SpaceX, cũng như chủ sở hữu của Twitter. Musk là người giàu nhất thế giới tính đến tháng 1 năm 2025; Forbes ước tính giá trị tài sản ròng của ông là vào khoảng 426 tỷ USD.	202000	f	2020	caa9dd8c-9c15-4eec-a31a-7a52494e2a93	1062	\N	4.9	176	2b9f6f7b-0db7-4f19-80c2-986834049e21	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
135ec7f3-23e3-4274-bfd7-2b55b0a66b6b	Cho tôi xin một vé đi tuổi thơ	https://product.hstatic.net/200000481913/product/65993ab0-32c3-457b-bbc8-ced708c33403_18c8b8dc531843aa9e2f439f8507027d_master.jpg	Trong khi đó ở Việt Nam cho đến nay, dưới góc nhìn của một đơn vị tổ chức, tôi cho rằng khoảng 80% rủi ro đến từ ...	228000	t	2023	c9a7d861-7a08-4301-98ef-bfd8b01918e1	1636	\N	4.5	233	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
196e9d44-fda3-482e-ad3c-7f7838d23d35	Lần đầu làm sếp	https://i.pinimg.com/736x/82/91/be/8291be165d8d4a58e0701a92a9dc29fe.jpg	Làm lãnh đạo khổ lắm, phải biết cách hét ra lửa, phải biết truyền nhiệt huyết cho cả tập thể, hơn hết là phải biết cười, biết tươi mặc dù sự việc chẳng có gì hài hước.	159000	f	2020	c9a7d861-7a08-4301-98ef-bfd8b01918e1	942	\N	3.6	104	825981e6-0d7d-451e-be77-ae6716668230	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
381aab9c-203d-477f-808d-ed5c53fd6d9e	Quẳng gánh lo đi và vui sống	https://product.hstatic.net/200000900535/product/4_e91721fc774f4e8f8f3051e997dc3b60_1024x1024.png	... dilemma Angelina Melnikova is so back How did her vaults look? WE NEED TO TALK ABOUT BRAZIL'S GENIUS LEOS Flavia showed beam and floor - how'd it go ...	118000	f	2023	e97df86b-d286-4880-9729-9366f7a70111	1702	\N	4.3	387	2b9f6f7b-0db7-4f19-80c2-986834049e21	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
69e0ae03-82ec-4481-bd27-32b1a9923f01	Lớp học mật ngữ	https://down-vn.img.susercontent.com/file/c5f0cdfa521780303afb340965ddcafa	Lớp Học Mật Ngữ là một đặc san của báo Hoa Học Trò, được đông đảo độc giả yêu thích. Bộ truyện lấy nhân vật chủ chốt là các cung Hoàng Đạo, lồng ghép các yếu tố mang tính giáo dục và giải trí một cách khéo léo nên rất được phụ huynh ưu tiên cho bé nhà mình đọc.	237000	f	2022	d5cf4565-7d4a-4984-a31b-806d087df158	335	\N	4.7	203	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
d3045ee9-2a3a-45d8-b7df-8aba4ff1e817	Warren Buffett	https://down-vn.img.susercontent.com/file/3e704d90077d4742d7f155622753d3b4	A chest level portrait of Warren Buffet against a dark background wearing a dark suit, a white shirt, and a red tie. He is unsmiling, looking past the camera.Leila Stahl Buffett (mother). Relatives. Howard Warren Buffett (grandson). Doris Buffett (sister). George Buffett (cousin).	133000	f	2014	78149431-de90-4e14-bd6f-c274d09d83f3	1082	\N	0.0	52	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
c8f08bdc-be7d-4615-a0d8-edca6bb6fe58	Lê Vân: Yêu và Sống	https://sachvuii.com/wp-content/uploads/2024/07/14715-le-van-yeu-va-song-1.jpg	26 mẫu tóm tắt Kiến và người ngắn gọn, chi tiết, đầy đủ các ý giúp học sinh soạn Kiến và người hiệu quả.	109000	f	2012	78149431-de90-4e14-bd6f-c274d09d83f3	1676	\N	0.0	442	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
34e22eca-8d67-4261-b074-b54a9b013a5f	Bàn về tự do	https://www.sachbaokhang.vn/uploads/files/2023/08/21/z4622731398176_f9f7dd9700ab26f4a387c968a91ba281.jpg	Bàn về tự do (nguyên gốc tiếng Anh: On Liberty) là một trong những tác phẩm triết học nổi tiếng nhất của John Stuart Mill, một nhà triết học thực chứng người Anh. Được xuất bản năm 1859, tác phẩm áp dụng hệ thống đạo đức của chủ nghĩa vị lợi của Mill cho xã hội và nhà nước.	200000	f	2014	4a9ab33e-26f1-42f3-84d1-87b31b8b9085	1988	\N	0.0	255	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
72a95062-477c-4409-9a08-08644d5b7377	Khởi nghiệp tinh gọn	https://mocongtysingapore.com/wp-content/uploads/2022/12/sach-khoi-nghiep-tinh-gon.jpg.jpg	Khoi Nghiep Tinh Gon Nội dung chính: Tại Việt Nam tinh thần khởi nghiệp chưa bao giờ mạnh mẽ như những năm gần đây.	189000	t	2023	3a87d9d8-2208-4cd1-8ea5-292048a2b075	1203	\N	3.9	225	b84ab1cd-f9e0-436f-8574-95c64f6ff2aa	02db20e4-91f0-411e-92cf-943d30be1daf
81809a04-974d-48a7-9d1a-d738f0fc4f2b	Tôi Thấy Hoa Vàng Trên Cỏ Xanh	https://mir-s3-cdn-cf.behance.net/project_modules/hd/1d7e75202821565.668cdd3468078.jpg	Phim Chiếu Rạp. Tôi Thấy Hoa Vàng Trên Cỏ Xanh.Mẹo cho các bạn nếu không tìm thấy phim, hãy tìm kiếm trên Google với cú pháp như sau: Tên Phim + MotChill .	125000	f	2024	e0fc99d3-97ad-4486-94f6-22deebd198fe	5000	\N	4.8	1250	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
329f2409-b3ae-4e2e-aa80-a44e8a7ebd13	Jujutsu Kaisen	http://tidosa.com.au/cdn/shop/files/jujutsu-kaisen-tap-18-limited.jpg?v=1698402763	Tóm Tắt Nhanh Jujutsu Kaisen Chap 227.Nội dung chính trong Jujutsu Kaisen chap 227 đưa mạch truyện lên đỉnh điểm khi trận quyết chiến giữa Satoru Gojo và Ryomen Sukuna bước vào giai đoạn căng thẳng nhất.	249000	f	2023	b886df78-48c0-4f05-ad08-0e587b7bb636	1179	\N	3.6	60	825981e6-0d7d-451e-be77-ae6716668230	1eec97aa-eb80-4f10-ba91-804f1829440e
e2e4c6f5-e8a3-49e7-b88b-b0e062044c74	Không bao giờ là thất bại	https://chiasemoi.com/wp-content/uploads/2018/12/khong-bao-gio-that-bai.jpg	Đây là những lời tựa ngắn gọn, xúc tích cho cuốn Không bao giờ là thất bại tất cả chỉ là thử thách mà đích thân chủ tịch tập đoàn Trung Nguyên Đặng Lê Nguyên Vũ đề tặng cho cuốn sách thuộc tủ sách đổi đời do chính ông là người chịu trách nhiệm.	51000	t	2022	78149431-de90-4e14-bd6f-c274d09d83f3	1612	\N	0.0	355	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
1bdea4d3-775f-40a8-a4cc-fd23877cbb2d	Đắc nhân tâm	https://cungdocsach.vn/wp-content/uploads/2020/10/Đắc-nhân-tâm-3-1024x682.jpg	Vậy nội dung cuốn sách Đắc Nhân Tâm nói về điều gì? Tại sao mọi người lại yêu thích nó đến vậy.	130000	f	2022	846d96e8-bd85-40f1-94e2-0d8373da1c1a	497	\N	0.0	477	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
743f7135-1ce0-4a90-902d-c6ea34c8e4dd	7 thói quen để thành đạt	https://xemsachhay.com/wp-content/uploads/2018/04/31009_37534.jpg	Mình khi đó cũng vậy, chỉ thấy tiếng việt đẹp, nội dung thì chẳng thấu thị được hết.	284000	f	2012	846d96e8-bd85-40f1-94e2-0d8373da1c1a	1501	\N	0.0	155	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
0d4ff6dd-8ce9-4326-9128-e8dd7ad2a644	Đừng bao giờ đi ăn một mình	https://pos.nvncdn.com/fd5775-40602/ps/20240514_wLFoEQxVrI.png	Dung Bao Gio Di An Mot Minh 1.Cam kết: đúng mô tả – đúng giá – giao nhanh – hỗ trợ đổi trả theo chính sách minh bạch. Địa chỉ : số 3 đường Louis X Đại Mỗ, Hà Nội. SĐT : 0899625089.	218000	f	2018	0cfca9ae-ed67-45db-a054-7e8699bbe9aa	1204	\N	0.0	320	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
27dd3ade-68d3-45e1-8dae-1fb393406233	Khéo ăn khéo nói sẽ có được thiên hạ	https://sachxua.vn/wp-content/uploads/2022/06/review-kheo-an-noi-se-co-duoc-thien-ha.jpg	Hàn Quốc và Malaysia đã có một cách tiếp cận rất thú vị, trong đó các chính sách quản lý thiên về việc tạo điều ...	349000	f	2022	0cfca9ae-ed67-45db-a054-7e8699bbe9aa	279	\N	0.0	351	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
13f097cf-e722-4edb-a934-32513991115b	Lối sống tối giản của người Nhật	https://thehanoichamomile.com/wp-content/uploads/2020/03/dscf6905.jpg	loi song toi gian cua nguoi nhat. Người Nhật sống như thế nào với phong cách Danshari?Đầu tiên, nói đến phong cách sống tối giản, ai cũng nghĩ đến một ngôi nhà nhỏ với nội thất đơn giản nhưng biết tận dụng tối đa công năng của nó.	296000	f	2022	0cfca9ae-ed67-45db-a054-7e8699bbe9aa	765	\N	0.0	264	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
082afe15-e1b8-44cc-b486-05225aa86dbf	Ưu thế của người hướng nội	https://cdn0.fahasa.com/media/catalog/product/b/_/b_a_tr_c__u_th_k_h_ng_n_i_bebooks.jpg	Oct 2, 2022 · Người hướng nội là gì và có gì khác so với người hướng ngoại? Những dấu hiệu nào để nhận biết người hướng nội? Hướng nội có phải là người nhút nhát, trầm cảm? Bài viết dưới đây sẽ giúp bạn khám phá thế giới và tính cách người hướng nội.	260000	f	2024	846d96e8-bd85-40f1-94e2-0d8373da1c1a	1485	\N	0.0	451	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
71867a2e-421e-498a-8fe0-4502b366346d	Sự im lặng của bầy cừu	https://revelogue.com/wp-content/uploads/2020/07/su-im-lang-cua-bay-cuu-e1594107291423.jpg	Sự im lặng của bầy cừu là một tiểu thuyết trinh thám kinh dị của tác giả Thomas Harris. Được xuất bản lần đầu tiên vào năm 1988, đây là phần tiếp theo của cuốn tiểu thuyết Rồng đỏ năm 1981 của Harris. Cả hai cuốn tiểu thuyết đều kể về Tiến sĩ Hannibal Lecter, một kẻ giết người hàng loạt ăn thịt người.	221000	f	2014	b65bb8c9-b221-4e30-a94e-677bb7159097	1721	\N	0.0	217	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
176e053b-96a2-48db-8d68-509e04e616c2	Án mạng trên chuyến tàu tốc hành Phương Đông	https://www.netabooks.vn/Data/Sites/1/Product/17154/1.jpg	Bài viết này sẽ cung cấp một cái nhìn toàn diện, từ tóm tắt nội dung, phân tích sự đặc sắc trong nghệ thuật xây dựng nhân vật cho đến những giá trị nhân văn sâu sắc được gửi gắm.Vụ án mạng xảy ra trên chuyến tàu tốc hành phương đông.	91000	f	2020	b65bb8c9-b221-4e30-a94e-677bb7159097	266	\N	0.0	99	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
6001fe99-dec8-4dd3-8021-e3366f396ec3	Dòng máu	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lw6to740z4rd67	- Xác định với người nói về nội dung em vừa tóm tắt. Trao đổi lại những ý kiến em chưa hiểu rõ hoặc có quan điểm khác.	71000	t	2011	b65bb8c9-b221-4e30-a94e-677bb7159097	484	\N	0.0	312	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
126f0c0c-ac34-46ac-9fce-097f34abb196	Tuổi trẻ đáng giá bao nhiêu	https://product.hstatic.net/200000481913/product/74ac9e86-3b66-4e77-ad84-bf1ddb20d0f8_1793d1ecf1e2482f8913583879ea3933_master.jpg	Tôi nghĩ giới trẻ cần phải nhìn nhận thật rõ ràng, đặt con tim mình cho thật đúng chỗ, yêu nước thì có thể đưa ...	121000	f	2018	0cfca9ae-ed67-45db-a054-7e8699bbe9aa	738	\N	0.0	13	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
3eda0eaa-3eed-4eff-8a4d-47a5ce719291	Chiến tranh tiền tệ	https://cf.shopee.vn/file/sg-11134201-22120-upoajjfyfvkva1	Chiến tranh Ukraine: Năm yếu tố tác động đến cuộc chiến tranh Ukraine trong năm 2024 ... Chiến tranh Ukraine: Năm yếu tố ...	90000	f	2016	b886df78-48c0-4f05-ad08-0e587b7bb636	1536	\N	0.0	475	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
1af1ccd7-53eb-4d6d-bd18-af5481020272	Yêu em từ cái nhìn đầu tiên	https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lhsn6rs6l7yd9a	Phim được khởi quay ngày 25 tháng 8 năm 2015 và đóng máy vào tháng 11 cùng năm. Nội dung phim kể về mối tình lãng mạn từ trong trò chơi đến đời thực của Tiêu Nại và Bối Vi Vi. Phim với độ dài 30 tập và được trình chiếu lần đầu vào ngày 22 tháng 8 năm 2016.	344000	f	2023	30d3154e-4f94-4bab-be88-f2dfc408cec2	682	\N	0.0	497	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
f2eacc4f-3ce4-4957-8e9c-004144162d53	Mãi mãi là bao lâu	https://i0.wp.com/bloganchoi.com/wp-content/uploads/2019/09/mai-mai-la-bao-xa-1.jpg	Thứ ba, học cách hiểu và bao dung những khuyết điểm của nhau. Như người ta thường nói: Không ai là hoàn hảo. Too good to be true - Cái gì quá tốt thì hoặc là phải trả giá đau đớn, hoặc là không có thật.	176000	f	2011	30d3154e-4f94-4bab-be88-f2dfc408cec2	619	\N	0.0	15	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
635730db-f82d-4fd9-a0dc-58c4a9e77878	Hai vạn dặm dưới đáy biển	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9t_Jaywk-7ckFG7AF3LR25qQ0_W4O3F_JiiRPNsEVf6e7eJNhwII7ReMJ2jbG-kERWRxZL5WpHYXYFMA7Mr2uCIHTuqiZMEdSgwHCNQ&s=10	Jules Verne đã viết một phần tiếp theo của cuốn sách này: L'Île mystérieuse (Hòn đảo bí mật hay "Bí mật đảo Lincoln", 1874), nội dung của tác phẩm này là câu chuyện kế tiếp hai tác phẩm Hai ngàn dặm dưới biển và Những đứa con của thuyền trưởng Grant.	305000	f	2014	3a87d9d8-2208-4cd1-8ea5-292048a2b075	984	\N	0.0	241	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b8af7f7e-ddc9-47a3-8436-1b8d8de2b926	Bên nhau trọn đời	https://cdn0.fahasa.com/media/catalog/product/b/e/ben-nhau-tron-doi.jpeg	Nội dung bộ phim Bên Nhau Trọn ĐờiAddress 1: 25-T8 Nguyễn Bỉnh Khiêm, Phường Sài Gòn, (Quận 1) TP.HCM. Address 2: 138B-T6 Phường Giảng Võ (Ba Đình), Hà Nội. contact. vn2@gmail.com.	239000	t	2021	30d3154e-4f94-4bab-be88-f2dfc408cec2	1961	\N	0.0	302	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
74f28117-55fa-4a31-8070-684953e73193	Người giàu nhất thành Babylon	https://nhasachnamlong.vn/wp-content/uploads/2023/11/bia_tr_c_nguoi_giau_co_nhat_thanh_babylon_1_3_.jpg	Người giàu có nhất thành Babylon (tiếng Anh: The Richest Man in Babylon) là một tác phẩm của doanh nhân, nhà văn Mỹ George Samuel Clason viết về thể loại làm giàu xuất hiện năm 1926, nó là một cuốn sách giới thiệu về cách tiết kiệm, buôn bán và làm giàu của người dân cổ xưa thành Babylon.	69000	f	2024	30d3154e-4f94-4bab-be88-f2dfc408cec2	477	\N	3.6	284	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	701c05ae-7f15-43da-987a-a7e8f49dbee3
1f931b22-9433-4bf9-9a8f-fc598e740659	Hành trình về phương Đông	https://product.hstatic.net/200000017360/product/htvpd_bia_ao_-_b1_ca395ad63f534a429566aca94ff88d84_master.jpg	Apr 8, 2026 · Tóm lại, "Hành Trình Về Phương Đông" là một tác phẩm khai sáng, không chỉ mang đến những câu chuyện kỳ thú mà còn là một bản đồ tâm linh, dẫn lối cho những ai đang tìm kiếm sự thật, ý nghĩa cuộc đời và con đường trở về với bản chất chân thật của chính mình ...	160000	f	2022	c9a7d861-7a08-4301-98ef-bfd8b01918e1	1515	\N	4.7	212	47e95a77-6792-4f9f-8eec-d15bd7da9212	02db20e4-91f0-411e-92cf-943d30be1daf
5726a69c-fc33-4e62-89d4-a7f4ddd6524c	Vị tu sĩ bán chiếc Ferrari	https://cdn0.fahasa.com/media/flashmagazine/images/page_images/vi_tu_si_ban_chiec_ferrari_tai_ban_tu_cuon_tim_ve_suc_manh_vo_bien___tai_ban_2020/2021_05_06_16_40_49_6-390x510.jpg	Cuốn sách "Vị tu sĩ bán chiếc Ferrari" của Robin Sharma chính là chìa khóa để bạn khám phá những giá trị thực sự trong cuộc sống. Hãy tìm đến triết lý cuộc sống trong sách để tìm thấy chính mình và dẫn đường cho cuộc sống.	222000	t	2020	71e88f6c-5127-4ee7-a23b-2310233c6fee	97	\N	4.2	11	825981e6-0d7d-451e-be77-ae6716668230	02db20e4-91f0-411e-92cf-943d30be1daf
02a9d1c2-5aff-4736-b38d-21d4fd28847f	Để thế giới biết bạn là ai	https://product.hstatic.net/200000845405/product/3_3d496aa16a904a25bcb745a632de51ec_master.png	de the gioi biet ban la ai.Nội dung chính của sách gồm 4 phần: Phần 1: Triết lý đàm phán thông qua những tấm gương thành công trong việc quảng bá thương hiệu cá nhân.	224000	f	2022	9f4fec95-6ac2-48f6-825f-3b7b01949158	46	\N	3.6	351	47e95a77-6792-4f9f-8eec-d15bd7da9212	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
0be7c2de-c0a1-4774-8f2f-bb6edf857ba8	Sức mạnh của thói quen	https://cdn-img-v2.mybota.vn/uploadv2/web/17/17409/media/2022/09/12/10/35/1662969678_12378.png	Oct 9, 2024 · Bài viết này tóm tắt và review cuốn sách Sức Mạnh Của Thói Quen, chia sẻ cách thay đổi thói quen để đạt được sự thành công và phát triển bản thân.	112000	f	2022	d8531406-0072-4c21-85f2-bbfa584b801a	1777	\N	3.7	15	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	1eec97aa-eb80-4f10-ba91-804f1829440e
85949675-bb84-40a9-8ca7-7b2d9e86f4f8	Muôn kiếp nhân sinh	https://salt.tikicdn.com/cache/w1200/ts/product/30/ee/5a/e2aed009bb558b5d2cfbbe157b428ba4.jpg	“Muôn kiếp nhân sinh” là tác phẩm do Giáo sư John Vũ – Nguyên Phong viết từ năm 2017 và hoàn tất đầu năm 2020 ghi lại những câu chuyện, trải nghiệm tiền kiếp kỳ lạ từ nhiều kiếp sống của người bạn tâm giao lâu năm, ông Thomas – một nhà kinh doanh tài chính nổi tiếng ở New York.	226000	f	2020	b65bb8c9-b221-4e30-a94e-677bb7159097	1994	\N	4.5	94	825981e6-0d7d-451e-be77-ae6716668230	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
af52e3fe-7614-4c68-b093-81babe33fb04	Bốn thỏa ước	https://i.ytimg.com/vi/-L1GVX8JqOs/maxresdefault.jpg	Nov 11, 2022 · Bốn thỏa ước là cuốn sách chia sẻ những hiểu biết của các Toltec để giúp con người đạt được tự do cá nhân thông qua các thỏa thuận và niềm tin với bản thân và với người khác. Bài viết dưới đây, Thichvietlach.com sẽ giới thiệu về cuốn sách, tác giả, tóm tắt chi tiết và đánh giá từ độc giả về cuốn sách 4 thoả ước. Bạn cùng đón đọc nhé! Jan 8, 2026 · Hôm nay, tôi muốn chia sẻ với các bạn lý do tại sao chúng ta cần chúng, điều nào tôi cho là quan trọng nhất và làm thế nào bạn có thể áp dụng chúng vào cuộc sống của mình. Jun 10, 2025 · Bài viết này sẽ đi sâu vào tóm tắt nội dung sách “Bốn Thoả Ước”, giới thiệu bốn nguyên tắc cốt lõi và chia sẻ những trải nghiệm thực tế khi áp dụng chúng vào cuộc sống hàng ngày. “Bốn Thỏa Ước” xuất phát từ triết lý tinh hoa về vũ trụ và con người của nền văn minh Toltec, đưa ra quan niệm về “cái tôi, như bạn vốn là”, gần gũi với triết lý “bản lai diện mục” của phương Đông. Thiên về chỉ dẫn thực hành, nhưng Bốn thỏa ước của Don Miguel vẫn bao hàm một hệ thống triết lý về vũ trụ và nhân sinh minh bạch, giản dị, trong đó con người là một phần của tự nhiên, hài hoà, sòng phẳng và không giới hạn. Don Miguel Ruiz, một vị thầy tâm linh nổi tiếng quốc tế và tác giả của bộ sách "Toltec Wisdom Series" (tạm dịch: "Chuỗi Sách Triết Học Toltec"), bao gồm các cuốn sách bán chạy như "Bốn Thỏa Ước" và "The Mastery of Love" (tạm dịch: "Bí Quyết Của Tình Yêu"), đến từ một dòng ...	163000	f	2022	40a46084-f1dd-4d28-933d-c6fc107eb637	86	\N	4.5	411	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
a3022b7e-1c30-40f3-b728-e7fd34135d1e	Conan	https://www.chimenviolet.com/wp-content/uploads/2024/07/Conan_333444.jpg	Khám phá tin đồn AOV x Conan trong Liên Quân Mobile! Chúng ta cần thêm thời gian để xác thực thông tin này. #lienquan #xuhuong #lienquantiktok #aov. Đây là bản tóm tắt nội dung do AI tạo và không nhằm mục đích cung cấp ngữ cảnh thực tế.	190000	f	2014	caa9dd8c-9c15-4eec-a31a-7a52494e2a93	1989	\N	0.0	161	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
59459211-8b18-4a50-ae97-96a30f0678fa	Nhà Giả Kim	https://nxbhcm.com.vn/Image/Biasach/nhagiakimTB2020.jpg	Theo ông Lim, việc phụ trách chuyên môn và pháp lý có thể được giao cho các Liên đoàn để nhà tổ chức sự kiện dồn ...	69000	f	2024	e0fc99d3-97ad-4486-94f6-22deebd198fe	9000	\N	4.8	3200	2b9f6f7b-0db7-4f19-80c2-986834049e21	701c05ae-7f15-43da-987a-a7e8f49dbee3
221505c2-1c6e-4ecc-b818-76101a1c3f4a	Dế Mèn Phiêu Lưu Ký	https://salt.tikicdn.com/cache/w1200/ts/product/8f/c6/c0/e99c37dc9d6defa5db41c5665f2f8aea.jpg	Dế Mèn phiêu lưu ký là tác phẩm văn xuôi đặc sắc và nổi tiếng nhất của nhà văn Tô Hoài viết về loài vật, dành cho lứa tuổi thiếu nhi. Ban đầu truyện có tên là Con dế mèn (chính là ba chương đầu của truyện) do Nhà xuất bản Tân Dân, Hà Nội phát hành năm 1941.	65000	t	2024	4cb8c332-8da9-448a-b116-f87e67322878	3400	\N	4.7	850	825981e6-0d7d-451e-be77-ae6716668230	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
8ad364fe-8321-4764-ac4a-db9c73d34753	Tâm lý học đám đông	https://cdn0.fahasa.com/media/catalog/product/8/9/8935270703561.jpg	Trong bài viết này, tôi sẽ chia sẻ tóm tắt và review cuốn sách Tâm Lý Học Đám Đông của Gustave Le Bon. Đây là một tác phẩm kinh điển trong lĩnh vực tâm lý học xã hội, đem lại những giá trị đối với bất kỳ ai muốn hiểu về sự vận hành của đám đông và ảnh hưởng của nó đến xã hội.	100000	t	2018	9f4fec95-6ac2-48f6-825f-3b7b01949158	1807	\N	0.0	279	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b85fb22e-38a4-4635-bd34-0788ea6ac415	Lược sử vạn vật	https://cdn-images.kiotviet.vn/nhungvisao/f78c89b1128d46faa0010b940e5b4cf0.jpg	Tóm tắt nhanh “Lược sử vạn vật” (A Short History of Nearly Everything) của Bill Bryson là cuốn sách khoa học phổ thông kể hành trình nhận thức của nhân loại về vũ trụ và sự sống: từ Big Bang, hình…	262000	t	2014	71e88f6c-5127-4ee7-a23b-2310233c6fee	1293	\N	0.0	328	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
a1f65354-d3ca-4153-8778-d078dcf68f32	Thay đổi bản thân trong 60 giây	https://cdn0.fahasa.com/media/flashmagazine/images/page_images/60_phut_thay_doi_chinh_minh/2023_02_02_15_31_11_2-390x510.jpg	Và sâu xa hơn nữa, đây là tầng của cái mà Gregory Bateson, trong "Steps to an Ecology of Mind" (1972), gọi là Học tập bậc ba [Learning III]: cấp độ mà chủ thể không chỉ học nội dung mới, cũng không chỉ học cách học, mà còn thay đổi chính khung tham chiếu [frame of reference] qua ...	190000	f	2016	846d96e8-bd85-40f1-94e2-0d8373da1c1a	1331	\N	0.0	286	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
5ae618d9-a37a-4465-8a30-ca52e09cf678	Đừng bao giờ đi ăn một mình	https://cdn1.fahasa.com/media/catalog/product/8/9/8934974180630.jpg	Dung Bao Gio Di An Mot Minh.36.000 ₫45.000 ₫. Bạn tiết kiệm được: 9.000 ₫. Cuốn sách là cẩm nang kinh điển về nghệ thuật xây dựng và duy trì các mối quan hệ. Tác giả chỉ ra rằng thành công không đến từ tài năng đơn thuần mà phụ thuộc rất nhiều vào mạng lưới quan hệ.	246000	f	2022	d8531406-0072-4c21-85f2-bbfa584b801a	1985	\N	3.9	347	47e95a77-6792-4f9f-8eec-d15bd7da9212	1eec97aa-eb80-4f10-ba91-804f1829440e
686f43d7-13da-4d70-a83b-68bef48cae7a	Suối nguồn	https://archive.org/services/img/audio-sach-noi-suoi-nguon-ayn-rand/full/pct:500/0/default.jpg	Suối nguồn (tiếng Anh: The Fountainhead) là một tiểu thuyết xuất bản năm 1943 của nhà văn nữ Ayn Rand. Đây là tác phẩm thành công đại chúng đầu tiên của bà. Thu nhập từ tác quyền và chuyển thể sang điện ảnh từ tác phẩm này đã mang lại cho bà danh vọng và sự ổn định về tài chính.	84000	t	2014	c9a7d861-7a08-4301-98ef-bfd8b01918e1	1782	\N	0.0	153	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
a0c9f181-2dfa-409a-a35a-af287abaef7c	Thịnh vượng tài chính tuổi 30	https://down-vn.img.susercontent.com/file/sg-11134201-22100-g0f22rjztoiv39	Nếu các bạn có thêm tài khoản nào vui lòng báo cho chúng tôi tại Topic này để chúng tôi cập nhật.	85000	t	2010	b886df78-48c0-4f05-ad08-0e587b7bb636	1001	\N	0.0	369	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
2c8d2526-0c8d-4634-983d-172b0f809d5e	Doraemon	https://vn-test-11.slatic.net/p/680c3116e90a08f1f1a710e17be6dd93.jpg	Doraemon là một chú mèo máy được Nobi Sewashi (Nobi Nobito), cháu năm đời của Nobi Nobita, gửi từ thế kỷ 22 về quá khứ của ông mình để giúp đỡ Nobita trở nên tiến bộ và giàu có, tức là cũng sẽ cải thiện hoàn cảnh của con cháu Nobita sau này.	219000	f	2023	d9406a27-e12e-4bc7-8034-8e003d0bfbee	392	\N	5.0	314	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	1eec97aa-eb80-4f10-ba91-804f1829440e
2398bbdb-d1a3-4992-b250-cb9f0c5324fb	Hết thảy những điều tôi biết đều học được từ trường mẫu giáo	https://thanhnien.mediacdn.vn/Uploaded/thuyngan/2022_08_28/dsc08975-3155.jpg	Trường mẫu giáo hay trường mầm non (tiếng Anh: Kindergarten) là hệ thống chương trình giáo dục dành cho trẻ mầm non dựa trên các hoạt động chơi, ca hát, các hoạt động thực tế như vẽ tranh và tương tác xã hội như một phần trong quá trình chuyển tiếp từ nhà tới trường học (trường tiểu học).	127000	t	2024	66af3704-4ab6-4136-b04b-0863a1b312a1	1153	\N	5.0	462	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	701c05ae-7f15-43da-987a-a7e8f49dbee3
aa7c9018-6f2e-4b4d-913b-8f55558b9b3b	Kimetsu no Yaiba	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-luspt55qkwlu82	Thanh gươm diệt quỷ (鬼滅の刃 Kimetsu no Yaiba?, n.đ. 'Lưỡi gươm diệt quỷ') là một bộ manga Nhật Bản do Gotōge Koyoharu sáng tác và minh hoạ. Truyện kể về hành trình trở thành kiếm sĩ diệt quỷ của thiếu niên Kamado Tanjirō sau khi gia đình cậu bị quỷ sát hại và em gái Nezuko của cậu bị biến thành quỷ.	207000	f	2021	b65bb8c9-b221-4e30-a94e-677bb7159097	1054	\N	4.7	398	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
78b8db46-ecfb-42f7-887a-5d5e1d7d28f7	Steve Jobs	https://newshop.vn/public/uploads/news/nhung-cuon-sach-khuyen-ban-nen-doc-cua-steve-jobs-min.jpg	Nội dung bài viết. Có rất nhiều câu chuyện về cuộc đời của vị CEO tài ba Steve Jobs được thể hiện bằng sách, phim tài liệu hay thậm chí là phim điện ảnh.	154000	t	2024	ff482523-2593-44f0-9b9f-3f8ec7105760	961	\N	4.4	275	47e95a77-6792-4f9f-8eec-d15bd7da9212	02db20e4-91f0-411e-92cf-943d30be1daf
219b7f37-d3e4-4b09-aea7-fc37f34d5660	Lupin	https://cf.shopee.vn/file/cde457dab63a6b849d42df20a9c6aa97	Khám phá công cụ AI giúp tóm tắt nội dung từ sách, báo & tài liệu dài thành ý chính chỉ trong vài giây. Xem ngay danh sách công cụ trên AIAppVN!.	157000	f	2021	9dfac958-3eb2-4044-ba45-f9664e58acb4	447	\N	3.7	135	b84ab1cd-f9e0-436f-8574-95c64f6ff2aa	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
1a15e4d7-1675-4110-abc3-86718d5243d5	Sherlock Holmes	https://down-vn.img.susercontent.com/file/vn-11134208-7ras8-m1pz940mc66rb8	Thám tử Sherlock Holmes nổi tiếng với tư duy logic và lập luận sắc bén đã làm xiêu lòng biết bao trái tim mang máu hình sự. Bao con tim hồi hộp dõi theo từng bước chân phá án của đôi bạn Holmes và Watson.	97000	t	2023	e0fc99d3-97ad-4486-94f6-22deebd198fe	1065	\N	5.0	15	8a5d23f0-291a-4184-a347-b6f61fc2fd4a	eaa8e900-6836-4d57-b8f6-4ab8ef37d746
1f07c05f-6313-4806-a30d-d25fda9fc5d9	Lịch sử âm nhạc thế giới	https://lic.haui.edu.vn/media/79/t79413.jpg	Cuộc sống , Việt Nam 1001 thay đổi , Việt Nam.Thế giới , Đi Chơi ... TO LEARN TV for the May 3rd Day of Action :: Xem truyền hình ...	323000	f	2023	66af3704-4ab6-4136-b04b-0863a1b312a1	1875	\N	0.0	222	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
00de9b4c-aa9e-44bc-bb51-efa92c084b53	One Piece	https://salt.tikicdn.com/ts/review/7f/2d/fe/fe55597aa1ea18e1a1071849c7e5ebbc.jpg	Để thực hiện một bài thuyết trình FEATURE PRESENTATION trong một buổi họp BNI có thời lượng 8 phút, bạn có thể tuân theo các bước sau: Tải về File PDF: 1. **Lập kế hoạch trước:** Xác định chủ đề chính cho bài thuyết trình của bạn và chuẩn bị nội dung cụ thể.	158000	f	2022	cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	1427	\N	3.9	47	b84ab1cd-f9e0-436f-8574-95c64f6ff2aa	1eec97aa-eb80-4f10-ba91-804f1829440e
a5b47cd7-9402-4b6e-8ee4-f93296b22d2c	Xách ba lô lên và đi	https://bloganchoi.com/wp-content/uploads/2019/04/xach-ba-lo-len-va-di.jpg	Tóm tắt nội dung cuốn sách Xách Ba Lô Lên Và Đi Xách Ba Lô Lên Và Đi là bộ sách của Huyền Chip, giới thiệu đến bạn đọc hành trình du lịch bụi vòng quanh thế giới của cô khi chỉ mới 20 tuổi, với số tiền ban đầu rất ít ỏi.	124000	f	2020	d8531406-0072-4c21-85f2-bbfa584b801a	53	\N	0.0	289	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
3136bf53-ce42-4454-a8fb-97c19cee95be	Con đường Hồi giáo	https://www.vietbookalley.com.au/cdn/shop/products/con-duong-hoi-giao_1100x.webp?v=1663486800	Con đường Hồi giáo là hành trình đi xuyên qua lịch sử đạo Hồi, vén màn giai đoạn Mùa xuân Ả Rập. Tác giả sinh năm 1976, với kinh nghiệm từng đặt chân đến vài chục quốc gia trên thế giới, đã chấp bút cuốn sách kể về khu vực Trung Đông nổi tiếng với thuốc súng, chiến trận. Vừa kín đáo vừa cởi mở.	309000	t	2013	d8531406-0072-4c21-85f2-bbfa584b801a	546	\N	0.0	498	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
2a8976d9-dd0e-4d13-ba62-89ca072e78bc	Câu chuyện nghệ thuật	https://product.hstatic.net/1000328521/product/bia_1_-_cau_chuyen_nghe_thuat_5d618ae73a25410bb6fa397e4b27317e_master.jpg	Tóm tắt nội dung Cấu trúc của cuốn sách bao gồm: phần mở đầu và 28 chương nội dung. Trong đó mỗi chương đề cập đến một giai đoạn nhất định của lịch sử nghệ thuật đặt trong một hoặc một số bối cảnh văn hóa hay địa lý.	248000	f	2020	66af3704-4ab6-4136-b04b-0863a1b312a1	953	\N	0.0	170	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
019d59a9-f4e3-48db-a66c-a13177e8e8a6	Lưới trời ai dệt	https://product.hstatic.net/200000163707/product/20220724_131729_92be8c96adf6475ea2a073a0343bcdd0_master.jpg	Đây là bản tóm tắt sách nên một số chương đã được đổi tên cho phù hợp với tóm tắt. Mỗi mindmap được đọc từ trên xuống dưới, từ phải qua trái	118000	f	2019	66af3704-4ab6-4136-b04b-0863a1b312a1	1634	\N	0.0	381	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
a28712af-bfd0-41a7-bbc5-b6a1e2e05f01	Bí mật hội họa	https://imgv2-2-f.scribdassets.com/img/document/833499728/original/7072da4428/1?v=1	Good Luck - Bí mật của may mắn sau khi phát hành đã bán được hàng triệu bản chỉ trong vài tháng ngắn ngủi. Các câu chuyện trong đây như những câu chuyện thần thoại với những chân lý thực tế của cuộc sống được viết rất lôi cuốn, hấp dẫn.	93000	f	2013	66af3704-4ab6-4136-b04b-0863a1b312a1	1211	\N	0.0	99	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
9125db60-888b-495c-97f7-f090261883be	Quá trẻ để chết	http://sachtiengviet.com/cdn/shop/files/16a822f0eb4de2c4071f7862d6a9f022_1024x1024.jpg?v=1752854584	Aug 3, 2025 · Sự hấp dẫn của “Quá trẻ để chết” đối với sinh viên không chỉ đến từ nội dung mà còn từ cách tác giả chạm đến những vấn đề cốt lõi mà tuổi trẻ đang phải đối mặt.	326000	f	2024	d8531406-0072-4c21-85f2-bbfa584b801a	1672	\N	0.0	384	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
8df86a17-f70c-46ce-b8b3-9c7ebdb226e7	Lược sử thời gian	https://cdn1.fahasa.com/media/catalog/product/8/9/8936066693882.jpg	Lược sử thời gian. (A Brief History of Time).Thông thƣờng tôi sẽ sử dụng các biểu đồ trong đó thời gian tăng lên trên và một trong những chiều không gian đƣợc trình bày theo đƣờng nằm ngang.	255000	f	2015	7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	653	\N	0.0	99	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
f378cfa4-0414-410d-9409-734d1935a8bf	Điểm bùng phát	https://salt.tikicdn.com/ts/product/de/75/91/46b0bcac0ebc92d36c4a43603f065242.jpg	... tôi không chia sẻ bất kỳ thông tin phân tích hoặc liên lạc nào của bạn với bên thứ ba! Thông tin thêm có thể được ...	283000	f	2022	7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	1181	\N	0.0	263	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
f80b69c0-dbab-41b0-8a83-aa67ff680481	Cách tân	https://xemsachhay.com/wp-content/uploads/2018/04/48221_54764.jpg	When the CC is not in session, decision-making powers are delegated to its internal bodies; that is, the Politburo and the Secretariat .	64000	f	2017	7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	704	\N	0.0	156	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
46945e35-d8c6-44e3-9937-5949e0c46e75	Thời đại AI	https://cdn0.fahasa.com/media/flashmagazine/images/page_images/thoi_dai_ai_va_tuong_lai_loai_nguoi_chung_ta/2023_10_10_16_34_01_1-390x510.jpg	Trí tuệ nhân tạo (tiếng Anh: Artificial intelligence, viết tắt là AI) là khả năng của các hệ thống máy tính thực hiện các nhiệm vụ liên quan đến trí thông minh của con người, như học tập, suy luận, giải quyết vấn đề, nhận thức và đưa ra quyết định. Đây là một lĩnh vực nghiên cứu thuộc khoa học máy tính ...	90000	f	2021	7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	1327	\N	0.0	447	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
159723a9-a3b9-4ff1-bdf7-9e417b43c26a	Việt Nam sử lược	https://salt.tikicdn.com/ts/product/2f/7f/4a/64aaaaf061ac11d9651f7e3d3f5ece3c.jpg	Cuộc sống , Việt Nam 1001 thay đổi , Việt Nam.Thế giới , Đi Chơi ... úng sai trong việc dạy con giữ tiếng Việt và nói ...	83000	f	2017	71e88f6c-5127-4ee7-a23b-2310233c6fee	662	\N	0.0	286	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
26e34eac-fcaf-45c7-b195-f909240f4bcd	Lịch sử thế giới	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lkoxxn2rcpzkf7	các bạn ơi, sao lại tóm tắt nội dung phim theo kiểu bình thương thế, sao không dùng từ hán việt hoặc thêm các yếu t ...	180000	f	2021	71e88f6c-5127-4ee7-a23b-2310233c6fee	1228	\N	0.0	392	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
87ea03bf-6d44-4902-9d5f-7db508583ed3	Đại Việt sử ký toàn thư	https://salt.tikicdn.com/ts/product/a7/18/47/e4d30a34e0e1970b921e6c8de04515c6.jpg	Đại Việt sử ký toàn thư (大越史記全書), đôi khi gọi tắt là Toàn thư, là bộ quốc sử viết bằng Hán văn của Việt Nam, viết theo thể biên niên, ghi chép lịch sử Việt Nam từ thời đại truyền thuyết Kinh Dương Vương năm 2879 TCN đến năm 1675 đời vua Lê Gia Tông nhà Hậu Lê.	297000	f	2017	71e88f6c-5127-4ee7-a23b-2310233c6fee	1196	\N	0.0	394	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b20cd4c1-6725-4a94-ae8c-44302de86fff	Nuôi con không phải là cuộc chiến	https://cdn0.fahasa.com/media/catalog/product/8/9/8935280909052_1_1.jpg	Cuốn sách tập trung vào việc xây dựng mối quan hệ yêu thương giữa cha mẹ và con, nhấn mạnh rằng nuôi con là hành trình đồng hành, không phải đối đầu. Nội dung được chia thành ba phần chính: hiểu trẻ, nuôi dạy nhẹ nhàng, và giải quyết vấn đề thường gặp. 1. Hiểu tâm lý và nhu cầu của trẻ.	112000	f	2019	cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	1642	\N	0.0	398	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
3ca8ded0-44c8-4842-964a-87ca7f30b15d	Chờ đến mẫu giáo thì đã muộn	https://down-vn.img.susercontent.com/file/65273ea0fb85969b88237b18b4ccbc05	Chờ đến mẫu giáo thì đã muộn là cuốn sách bàn về phương pháp giáo dục trẻ trong giai đoạn từ 0 đến 3 tuổi của tác giả Ibuka Masaru, người sáng lập tập đoàn Sony đồng thời là một nhà nghiên cứu giáo dục.	60000	f	2012	cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	1456	\N	0.0	438	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
7cf1c534-03e0-42bb-8138-b377b616ca0b	Cha mẹ là người thầy tốt nhất	https://thuviensach.vn/img/news/2022/08/larger/927-cha-me-la-nguoi-thay-dau-tien-tot-nhat-1.jpg?v=1702	Thực ra mình thấy, thể loại sách intro kiểu này khó viết hơn là những sách khác. ... triển của xã hội nảy sinh ra ...	335000	f	2014	cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	1573	\N	0.0	261	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
4d907ea2-3f8b-424c-af28-0d4c813aa641	Con không bao giờ đi một mình	https://cdn0.fahasa.com/media/catalog/product/9/7/9786047736065-1.jpg	Có khi là do lúc đó đã quen với cách viết của tác giả, hay là do không quá kỳ vọng nên mới có thể thưởng thức ...	69000	f	2019	cfd98b01-c26b-4ecf-ac7a-891545e0cc0c	319	\N	0.0	294	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
1d066d96-94a1-4a4b-89cc-32f9233e94d6	Toán 1	https://hoc10.monkeyuni.net/E_Learning/page_public/AHc89lMuEtkPbVIlJQNWZIYItWNZQ3s5.jpg	Thu t toán này có th c implement b ng m t lo t các hàm condition (n u ph n d > 0.5 thì … , n u ph n d < 0.5 thì … , n u ph ...	171000	f	2010	d5cf4565-7d4a-4984-a31b-806d087df158	1003	\N	0.0	212	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
416a6113-f175-4e88-a041-87ef0df9d5ae	Ngữ văn 6	https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljdjusgxf45u5c	Tóm tắt bài. 1.1. Nhận biết đặc điểm và loại văn bản. - Văn bản: Là một đơn vị giao tiếp, có tính hoàn chỉnh về nội dung và hình thức, tồn tại ở dạng viết hoặc dạng nói.	318000	f	2015	d5cf4565-7d4a-4984-a31b-806d087df158	1858	\N	0.0	181	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
28146abf-eb0d-424b-9394-0b7adae5872a	Tiếng Anh 10	https://cdn0.fahasa.com/media/flashmagazine/images/page_images/tieng_anh_lop_10___sach_hoc_sinh_global_success_2022/2022_07_20_15_34_16_6-390x510.jpg	Chỉ với một click vào biểu tượng tiện ích hoặ c nhấp chuột phải trên trang, bạn sẽ nhanh chóng nắm bắt nội dung ...	199000	f	2023	d5cf4565-7d4a-4984-a31b-806d087df158	906	\N	0.0	218	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
9c543fac-ddfc-4c7b-93f3-474164d1457e	Hóa học 12	https://img.loigiaihay.com/picture/2024/0201/1.png	Với tóm tắt lý thuyết Hóa học 12 Kết nối tri thức hay nhất, chi tiết sẽ giúp học sinh lớp 12 nắm vững kiến thức trọng tâm, ôn luyện để học tốt môn Hóa 12. HOT 500+ Đề thi thử tốt nghiệp THPT, ĐGNL các trường ĐH fle word có đáp án (2025). + Bộ giáo án, đề thi tốt nghiệp THPT, DGNL các trường các trường có lời giải chi tiết 2025 tại. + Hỗ trợ zalo:	248000	f	2014	d5cf4565-7d4a-4984-a31b-806d087df158	306	\N	0.0	249	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
008cb162-df2f-4dd6-b860-f62fb10c12c2	Vũ trụ	https://product.hstatic.net/200000273991/product/boxset-vu-tru_e570dc2eda994731806bfadd184aac21_master.jpg	Chỉ với một click vào biểu tượng tiện ích hoặ c nhấp chuột phải trên trang, bạn sẽ nhanh chóng nắm bắt nội dung ...	110000	t	2022	7ca1af5c-dafa-4f1f-91bb-053ec4bcf282	1384	\N	0.0	145	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
3129a900-fbb3-402d-a590-17a8a69eb32a	Đường xưa mây trắng	https://www.sachhanoi.vn/wp-content/uploads/2022/04/duong-xuamay-trang.jpg	"Đường Xưa Mây Trắng" của Thích Nhất Hạnh là một tác phẩm mang lại sự bình an và khai sáng cho độc giả. Nó không chỉ là một cuốn sách kể chuyện mà còn là một khóa học về thiền và đạo Phật, được trình bày một cách thi vị, sâu lắng và dễ hiểu.	105000	f	2011	60c94d60-447a-4d5c-800a-573c85d21682	1694	\N	0.0	466	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
d6a2ef04-ae26-46fb-9e05-2800948ff891	Tây tạng sinh tử kỳ thư	https://down-vn.img.susercontent.com/file/00f0cc1ca98b776ae5dbe1007b52e3dd	Một người Việt Nam, đặc biệt là thế hệ sinh ra trong hòa bình, cần phải tìm hiểu về lịch sử của dân tộc, đặc ...	165000	f	2023	60c94d60-447a-4d5c-800a-573c85d21682	531	\N	0.0	174	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
48a7a827-176e-4008-b408-5c1a31fd6e5d	Đối thoại với Thượng Đế	https://product.hstatic.net/200000079237/product/8_665f616ff3c741a6890522afc4030b4c_master.png	Chúng tôi không chia sẻ bất kỳ thông tin phân tích hoặc liên lạc nào của bạn với bên thứ ba! Thông tin thêm có th ...	73000	f	2024	60c94d60-447a-4d5c-800a-573c85d21682	1485	\N	0.0	169	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
689b8bf4-3b61-4828-bd22-16d895b9dbce	Hiểu về trái tim	https://cdn0.fahasa.com/media/flashmagazine/images/page_images/hieu_ve_trai_tim_tai_ban_2023/2023_02_21_08_51_07_6-390x510.jpg	ánh giá 2 sao không phải bởi nội dung hay kết cấu truyện dở tệ (ngược lại, quyển này rất lôi cuốn, bố cục kết n ...	156000	f	2016	60c94d60-447a-4d5c-800a-573c85d21682	1779	\N	0.0	429	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b13b2329-bdc0-476d-96c1-b7e458e588e9	Điệp viên 007	https://giasachonline.com/wp-content/uploads/2021/03/diep-vien-007-ruc-lua-mien-bang-tuyet-1024x1024.jpg	Daniel Craig, người thủ vai chính trong loạt phim “Điệp viên 007”, từng học Krav Maga phục vụ diễn xuất và vô tình làm bị thương cựu võ sĩ MMA.	299000	f	2023	4cb8c332-8da9-448a-b116-f87e67322878	128	\N	0.0	483	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
4efc6509-3e82-4814-a5ed-49dc1454ac41	Jason Bourne	https://cdn.kobo.com/book-images/f032350f-a118-4b91-a6d0-d04ba530ba83/1200/1200/False/the-jason-bourne-series-3-book-bundle.jpg	Tiêu dùng.Jason Bourne là tập phim thứ 5 thuộc thương hiệu về siêu điệp viên Jason Bourne nổi tiếng sau The Bourne Identity (2002), The Bourne Supremacy (2004), The Bourne Ultimatum (2007) và một phần phim ngoại truyện sản xuất năm 2012 có tên The Bourne Legacy.	301000	f	2024	4cb8c332-8da9-448a-b116-f87e67322878	1322	\N	0.0	484	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
4943a790-898f-45a0-9955-6feed57817b3	Rambo	https://imgv2-2-f.scribdassets.com/img/document/826434603/original/5d57ddf089/1?v=1	Chỉ trong phút chốc, quân Miến Điện bị tiêu diệt gần hết, Thiếu tá Tint bị Rambo giết bằng dao rựa. Rambo đứng nhìn những người bạn một lúc rồi bỏ đi. Bộ phim kết thúc với cảnh Rambo trở về Mỹ, anh đi bộ trên con đường ở Bowie, tiểu bang Arizona.	113000	f	2022	4cb8c332-8da9-448a-b116-f87e67322878	798	\N	0.0	318	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
02410c44-9786-42c1-8b07-7edbde1e857f	Die Hard	https://d28hgpri8am2if.cloudfront.net/book_images/onix/interior_spreads/9781608879731/die-hard-the-ultimate-visual-history-9781608879731.in11.jpg	Video: Thế Giới Nhìn Từ Vatican 1/8/2019: L ... Linh mục Ba Lan bị 3 người đánh tàn bạo trong phòng thánh, máu đầy mặt.	333000	f	2016	4cb8c332-8da9-448a-b116-f87e67322878	1294	\N	0.0	278	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
c7a89ea3-efa0-4190-a8c0-def1dbb567ff	Lão hạc	https://res.cloudinary.com/db4yeyxup/image/upload/v1776741028/book_store/wepirpkezh2dodz04i4n.jpg	Đây là tác phẩm lão hạc	100000	f	2001	e0fc99d3-97ad-4486-94f6-22deebd198fe	0	\N	0.0	0	c56a88d4-afb3-4b56-ae53-88c08703db87	701c05ae-7f15-43da-987a-a7e8f49dbee3
84146295-30fa-42b8-9e04-9ec5848800e0	Luyện siêu trí nhớ từ vựng	https://mcbooks.vn/wp-content/uploads/2021/05/3b391223112ee470bd3f.jpg	Nội dung cuốn sách. Thật đúng như vậy với Luyện siêu trí nhớ từ vựng được trình bày dưới dạng 13 chuyên đề, tương ứng với 13 bí mật học ngoại ngữ của người Do Thái, phần từ vựng cũng quét sạch các chủ đề trong bài thi TOEIC.	82000	f	2012	ff482523-2593-44f0-9b9f-3f8ec7105760	614	\N	0.0	126	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
593d90e9-4caa-4c18-8811-3f1c6af5f97d	Ngữ pháp tiếng Anh căn bản	https://newshop.vn/public/uploads/products/4940/ngu-phap-tieng-anh-can-ban.jpg	Bạn sẽ nắm chắc toàn bộ ngữ pháp Tiếng Anh căn bản. Đây là nền tảng quan trọng để hoàn thiện và nâng cao Ngữ pháp trong các khoá học khác.	269000	f	2012	ff482523-2593-44f0-9b9f-3f8ec7105760	1557	\N	0.0	352	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
b87de174-f466-4e9e-bd2a-93e274b34f01	Hồi ký Hillary Clinton	https://giasachonline.com/wp-content/uploads/2021/03/living-history-hoi-ky-hillary-clinton.jpg	Trong cuốn hồi ký, Bill Clinton xác nhận "mối quan hệ lẽ ra không nên có" với Gennifer Flowers, một ca sĩ quán rượu ở Arkansas. Những điều này đem đến cho Đệ Nhất Phu nhân một cảm giác lẫn lộn giữa sự đồng cảm và sự khinh miệt.	276000	f	2024	78149431-de90-4e14-bd6f-c274d09d83f3	389	\N	0.0	390	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
ca316100-0868-4a1c-a4b1-d936b3feff38	Becoming - Chất Michelle	https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lgn1b2am41tea8	2. Becoming - Chất Michelle (Bìa Cứng). Nội dung của cuốn sách Chất Michelle là những câu chuyện phản ánh chân thực và sâu sắc cuộc đời Michelle Obama do chính tác giả tự kể.	135000	f	2010	78149431-de90-4e14-bd6f-c274d09d83f3	388	\N	0.0	388	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
180c8b9d-56a7-406e-acb4-ebe94d40a321	Dune: Xứ cát	https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgnr5bn3u5u0c1	Lấy bối cảnh ở tương lai xa, phim theo chân chàng trai Paul Atreides khi Gia tộc Atreides của cậu bị đẩy vào cuộc chiến tranh giành hành tinh sa mạc Arrakis.	249000	f	2012	3a87d9d8-2208-4cd1-8ea5-292048a2b075	1724	\N	0.0	239	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
f298ae18-98f9-4746-a26e-71aa74a8e3d0	Trạm tín hiệu số 23	https://salt.tikicdn.com/ts/product/71/e9/7f/92fa96404ea7144d33f1b685057a854c.jpg	When the CC is not in session, decision-making powers are delegated to its internal bodies; that is, the Politburo and the Secretariat .	285000	f	2010	3a87d9d8-2208-4cd1-8ea5-292048a2b075	1308	\N	0.0	183	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
1e1492e5-a788-46b4-ae03-5df767564eee	Gió lạnh đầu mùa	https://down-vn.img.susercontent.com/file/4350953581b9d549738ef13e60e4ece2	Dung lượng phải vừa phải, nội dung vừa vặn, không được quá nông cũng như đi quá sâu vào tiểu tiết.	343000	f	2020	d9406a27-e12e-4bc7-8034-8e003d0bfbee	371	\N	0.0	348	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
7a337dc5-b686-4c74-be6d-2ec5f2f40e8d	Trại hoa vàng	https://www.netabooks.vn/Data/Sites/1/Product/25379/trai-hoa-vang.jpg	Chuẩn là một học sinh lớp 10, rất yêu thích hoa, sống trong một thị trấn yên bình tại miền Nam Việt Nam. Nhà cậu gồm có ba, mẹ và nhỏ em gái tên Châu. Ba cậu là người rất nghiêm khắc và dữ dằn, mỗi khi cậu bị điểm kém thì sẽ bị ông đá vào hạ bàn.	233000	f	2016	d9406a27-e12e-4bc7-8034-8e003d0bfbee	510	\N	0.0	376	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
3563c00d-d2e3-45bd-b012-0098cea55636	Sống hạnh phúc	https://mochibooks.vn/wp-content/uploads/2024/09/z5692369983532_383eca342375c0957e86800b728cc842-1024x1024.jpg	Mar 11, 2025 · Tóm tắt nội dung cuốn sách Sống Hạnh Phúc – Cẩm Nang Cho Cuộc Sống Cuốn sách Sống Hạnh Phúc – Cẩm Nang Cho Cuộc Sống là sự kết hợp giữa trí tuệ Phật giáo và tâm lý học hiện đại nhằm giúp con người tìm kiếm và duy trì hạnh phúc trong cuộc sống.	187000	f	2012	60c94d60-447a-4d5c-800a-573c85d21682	1560	\N	0.0	500	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
7c7c39d6-f938-4578-9c97-13aa224a9601	Con chó nhỏ mang giỏ hoa hồng	https://hd1.hotdeal.vn/images/uploads/2016/Thang%203/03/236695/236695-con-cho-nho-mang-gio-hoa-hong-body%20%281%29.jpg	Tôi nghĩ giới trẻ cần phải nhìn nhận thật rõ ràng, đặt con tim mình cho thật đúng chỗ, yêu nước thì có thể đưa ...	314000	f	2019	d9406a27-e12e-4bc7-8034-8e003d0bfbee	1183	\N	0.0	356	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
c790eccb-e372-4b5a-b7ab-76e1a1093a46	Tiếng Anh cho người bắt đầu	https://dimibook.com/wp-content/uploads/2024/07/cung-cap-nhung-tinh-huong-thong-dung-va-cach-dap-lai.jpg	Luyện nghe tiếng Anh cho người mới bắt đầu. Hãy nghe tiếng Anh mọi không gian và thời điểm mà bạn có thể, ví dụ nghe nhạc bằng tiếng Anh, xem tin tức bằng tiếng Anh, đọc sách, xem phim bằng tiếng Anh.	318000	t	2019	ff482523-2593-44f0-9b9f-3f8ec7105760	832	\N	0.0	489	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
64219ff7-0d6a-4782-b57d-f784b05770e8	Chiến tranh giữa các thế giới	https://thuviensach.vn/img/news/2022/11/larger/8757-chien-tranh-giua-cac-the-gioi-1.jpg	Những tác phẩm nổi tiếng của ông bao gồm “Cỗ Máy Thời Gian” (The Time Machine), “Người Vô Hình” (The Invisible Man), “Đảo Bác Sĩ Moreau” (The Island of Doctor Moreau) và dĩ nhiên, “Chiến Tranh Giữa Các Thế Giới.”	327000	t	2011	3a87d9d8-2208-4cd1-8ea5-292048a2b075	1558	\N	0.0	223	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
183e8248-e8a6-484f-b80e-684d1089e2a9	Những câu chuyện về tình yêu	https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/sach-ve-tinh-yeu-3.jpg	Không chỉ là câu chuyện tình yêu vừa đẹp đẽ vừa đẫm lệ, mà còn là một tác phẩm văn học mang ý nghĩa sâu sắc, giúp ta khám phá sự đối đầu giữa tình yêu và bóng tối. Nội dung bài viết. William Shakespeare nhà soạn kịch tài ba.	163000	t	2019	d9406a27-e12e-4bc7-8034-8e003d0bfbee	1116	\N	0.0	252	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
7aa39d0b-56db-4af9-9b3f-d73382045c09	Cha Giàu Cha Nghèo	https://down-vn.img.susercontent.com/file/73d93a446f2870205af3cb973029e06c	Nhưng có bao giờ bạn tự hỏi, tại sao người giàu ngày càng giàu, còn người nghèo thì vẫn nghèo? Cuốn sách “Cha Giàu Cha Nghèo” sẽ khiến bạn nhìn lại cách bạn hiểu – và đối xử – với tiền bạc. Cùng khám phá những thông tin thú vị của cuốn sách này nhé.	145000	f	2024	b886df78-48c0-4f05-ad08-0e587b7bb636	7500	\N	4.7	2800	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
598a46de-b464-40ce-93d6-d461f3402740	Mắt Biếc	https://library.phenikaa-uni.edu.vn/sites/default/files/Review-sach-Mat-biec-Nguyen-Nhat-Anh.jpg	Cái tên “Mắt biếc” là do bà nội của Ngạn đặt cho Hà Lan bởi vì đôi mắt Hà Lan đẹp và mộng mơ. Học chung cấp một, Ngạn thường bảo vệ Hà Lan trước những trò chơi chọc nghẹo của bọn con trai trong lớp.	110000	f	2024	e0fc99d3-97ad-4486-94f6-22deebd198fe	8200	\N	4.9	2100	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
936a936c-45bb-4d1d-a2de-a00dfbe2ec14	Từ tốt đến vĩ đại	https://cdn0.fahasa.com/media/catalog/product/n/x/nxbtre_full_09462021_024609_1.jpg	Cuốn sách đưa ra một mô hình để chuyển một công ty chỉ ở mức bình thường, hay ở mức tốt, thành một công ty vĩ đại. Bằng cách áp dụng con người kỷ luật, suy nghĩ kỷ luật và hành động kỷ luật một công ty có thể xây dựng và tạo sự đột phá và phá vỡ những rào cản ngăn mình đến sự vĩ đại.	154000	f	2022	9dfac958-3eb2-4044-ba45-f9664e58acb4	423	\N	0.0	348	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
ab186ab4-8264-4803-b8e5-df60ab38f85f	Nhà lãnh đạo không chức danh	https://www.netabooks.vn/Data/Sites/1/media/sach/nha-lanh-dao-khong-chuc-danh/nha-lanh-dao-khong-chuc-danh.jpg	Chúng ta sẽ đi tìm hiểu về Nhà Lãnh Đạo Không Chức Danh thông qua câu chuyện của Blake Davis - anh vốn làm thủ thư tại một thư viện nhỏ. Công việc như vậy nhưng anh hàng ngày phải đối mặt với những sang chấn tâm lý vì từng có thời gian phục vụ trong cuộc chiến khốc liệt ở Iraq.	279000	f	2011	9dfac958-3eb2-4044-ba45-f9664e58acb4	1264	\N	0.0	446	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
c9f40b39-c2ca-4f52-8f57-63847e5a7265	Dẫn dắt sự thay đổi	https://tiemsach.org/wp-content/uploads/2023/07/Ebook-Dan-dat-su-thay-doi.jpg	Đây là nhóm các nhà lãnh đạo hoặc các nhân viên có khả năng dẫn dắt và quản lý sự thay đổi trong toàn tổ chức. Nhóm dẫn đường có vai trò quan trọng trong việc định hướng, tạo động lực, và thực hiện các chiến lược thay đổi.	273000	f	2024	9dfac958-3eb2-4044-ba45-f9664e58acb4	167	\N	0.0	57	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
239f5145-22f1-46d5-bb39-09ce1b4f5a45	Nhà quản trị thành công	https://tramsach.vn/wp-content/uploads/2024/11/ai-nen-doc-cuon-sach-nay.jpg	Nha Quan Tri Thanh Cong.Quản trị chủ yếu được thực hiện bằng cách làm gương, do đó những nhà quản lý không biết cách làm việc hiệu quả sẽ không thể làm gương cho người khác noi theo.	97000	f	2024	9dfac958-3eb2-4044-ba45-f9664e58acb4	1125	\N	0.0	34	2b9f6f7b-0db7-4f19-80c2-986834049e21	17fffe51-bef2-4c9d-ab65-f3b756bd2b06
ad9edb1a-ecb5-4460-bc22-192639586b21	Lâm	http://res.cloudinary.com/db4yeyxup/image/upload/v1776754952/book_store/byatgjle0bszhduz0fds.jpg	tác phẩm Lâm	20000	t	2000	9cb30b26-2caa-4c2c-9d59-48097624fbe1	0	\N	0.0	0	89954111-63f6-4d84-8368-765e09c4985d	e83e1953-5a6c-45bf-a298-7109ba353cf0
\.


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provinces (code, name, "shortName", type) FROM stdin;
01	Thành phố Hà Nội	Thành phố Hà Nội	Thành phố Trung Ương
04	Cao Bằng	Cao Bằng	Tỉnh
08	Tuyên Quang	Tuyên Quang	Tỉnh
11	Điện Biên	Điện Biên	Tỉnh
12	Lai Châu	Lai Châu	Tỉnh
14	Sơn La	Sơn La	Tỉnh
15	Lào Cai	Lào Cai	Tỉnh
19	Thái Nguyên	Thái Nguyên	Tỉnh
20	Lạng Sơn	Lạng Sơn	Tỉnh
22	Quảng Ninh	Quảng Ninh	Tỉnh
24	Bắc Ninh	Bắc Ninh	Tỉnh
25	Phú Thọ	Phú Thọ	Tỉnh
31	Thành phố Hải Phòng	Thành phố Hải Phòng	Thành phố Trung Ương
33	Hưng Yên	Hưng Yên	Tỉnh
37	Ninh Bình	Ninh Bình	Tỉnh
38	Thanh Hóa	Thanh Hóa	Tỉnh
40	Nghệ An	Nghệ An	Tỉnh
42	Hà Tĩnh	Hà Tĩnh	Tỉnh
44	Quảng Trị	Quảng Trị	Tỉnh
46	Thành phố Huế	Thành phố Huế	Thành phố Trung Ương
48	Thành phố Đà Nẵng	Thành phố Đà Nẵng	Thành phố Trung Ương
51	Quảng Ngãi	Quảng Ngãi	Tỉnh
52	Gia Lai	Gia Lai	Tỉnh
56	Khánh Hòa	Khánh Hòa	Tỉnh
66	Đắk Lắk	Đắk Lắk	Tỉnh
68	Lâm Đồng	Lâm Đồng	Tỉnh
75	Đồng Nai	Đồng Nai	Tỉnh
79	Thành phố Hồ Chí Minh	Thành phố Hồ Chí Minh	Thành phố Trung Ương
80	Tây Ninh	Tây Ninh	Tỉnh
82	Đồng Tháp	Đồng Tháp	Tỉnh
86	Vĩnh Long	Vĩnh Long	Tỉnh
91	An Giang	An Giang	Tỉnh
92	Thành phố Cần Thơ	Thành phố Cần Thơ	Thành phố Trung Ương
96	Cà Mau	Cà Mau	Tỉnh
\.


--
-- Data for Name: publisher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publisher (id, name) FROM stdin;
17fffe51-bef2-4c9d-ab65-f3b756bd2b06	NXB Trẻ
eaa8e900-6836-4d57-b8f6-4ab8ef37d746	NXB Kim Đồng
701c05ae-7f15-43da-987a-a7e8f49dbee3	NXB Hội Nhà Văn
1eec97aa-eb80-4f10-ba91-804f1829440e	NXB Giáo Dục
02db20e4-91f0-411e-92cf-943d30be1daf	NXB Phụ Nữ
e83e1953-5a6c-45bf-a298-7109ba353cf0	NXB ABC
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review (id, rating, comment, "createdAt", "userId", "productId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, contact, password, verified, image, "isBlocked", "createdAt", "updatedAt") FROM stdin;
876f386f-64dc-423f-a004-b85df2777163	Test User	test1776404925078@example.com	123456789	$2b$10$VCNKlGg2wsNay4KhQ6a2fuT9.IfR7CC6qeHQpxEA1DxweTpy1f9S2	f	\N	f	2026-04-17 12:48:45.316529	2026-04-18 21:54:52.678578
a0f4c3a0-8022-42f7-a0d9-31e443530185	User Two	test2@example.com	987654321	$2b$10$95dftmoBrDqAltO6Kvhm/uMMzP.18bO7q26qhwvheknGrH/07olEu	f	\N	f	2026-04-17 13:52:04.729388	2026-04-18 21:54:56.471655
73cd2729-5b5d-4c4f-9162-97c8afca598f	lý thanh lâmuie	lam@gmail.com	7788666666444	$2b$10$2FcR/HbNGcG1N2B09JU3eezK9z/BhtU8q676SqJNb97vfVKNsC8XO	f	\N	f	2026-04-17 12:25:56.345742	2026-04-18 21:54:58.894593
03767770-033b-4c3f-98c7-6b858941d372	thanh	1@gmail.com	1231312312	$2b$10$ARKgSgToJg5XQk4FEJcu8ORzlQUVSJddfmbJku1Rk7NM.peErItbK	f	\N	f	2026-04-18 10:05:48.677255	2026-04-18 21:55:01.255484
fbea4b4d-0999-462a-a9c6-ecdcb2aa1511	Lam abc	campcnd14@gmail.com	0	$2b$10$uuTtKtYmMFhXWv2Q07nAiONKSzk1ALuPqscz/kXeYsTntOPi7.raW	f	\N	f	2026-04-18 14:18:54.397742	2026-04-18 21:55:03.830511
0da696a7-6feb-4f10-b169-6bd0397f5778	Kfrkd Djdjd	campcnd20@gmail.com	0	$2b$10$.FSezYkRFoIeF.In9XyTa.s0MuA4NShrFNK.pNlsKY/9BieuS0gDu	f	\N	f	2026-04-18 14:25:40.628952	2026-04-18 21:55:06.050067
b880f74c-8d60-4cc0-a052-d585de021e7e	Lâm	lythanhlam9@gmail.com	0	$2b$10$ugB6SvBPFkykzxQ10aA3Y.NXySfQt7QyuEbdgGgZKCymbefhhrnnG	f	\N	f	2026-04-18 14:45:29.519628	2026-04-18 21:55:10.59575
\.


--
-- Data for Name: wards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wards (code, name, "provinceCode") FROM stdin;
00004	Phường Ba Đình	01
00008	Phường Ngọc Hà	01
00025	Phường Giảng Võ	01
00070	Phường Hoàn Kiếm	01
00082	Phường Cửa Nam	01
00091	Phường Phú Thượng	01
00097	Phường Hồng Hà	01
00103	Phường Tây Hồ	01
00118	Phường Bồ Đề	01
00127	Phường Việt Hưng	01
00136	Phường Phúc Lợi	01
00145	Phường Long Biên	01
00160	Phường Nghĩa Đô	01
00166	Phường Cầu Giấy	01
00175	Phường Yên Hòa	01
00190	Phường Ô Chợ Dừa	01
00199	Phường Láng	01
00226	Phường Văn Miếu - Quốc Tử Giám	01
00229	Phường Kim Liên	01
00235	Phường Đống Đa	01
00256	Phường Hai Bà Trưng	01
00283	Phường Vĩnh Tuy	01
00292	Phường Bạch Mai	01
00301	Phường Vĩnh Hưng	01
00316	Phường Định Công	01
00322	Phường Tương Mai	01
00328	Phường Lĩnh Nam	01
00331	Phường Hoàng Mai	01
00337	Phường Hoàng Liệt	01
00340	Phường Yên Sở	01
00352	Phường Phương Liệt	01
00364	Phường Khương Đình	01
00367	Phường Thanh Xuân	01
00376	Xã Sóc Sơn	01
00382	Xã Kim Anh	01
00385	Xã Trung Giã	01
00430	Xã Đa Phúc	01
00433	Xã Nội Bài	01
00454	Xã Đông Anh	01
00466	Xã Phúc Thịnh	01
00475	Xã Thư Lâm	01
00493	Xã Thiên Lộc	01
00508	Xã Vĩnh Thanh	01
00541	Xã Phù Đổng	01
00562	Xã Thuận An	01
00565	Xã Gia Lâm	01
00577	Xã Bát Tràng	01
00592	Phường Từ Liêm	01
00598	Phường Thượng Cát	01
00602	Phường Đông Ngạc	01
00611	Phường Xuân Đỉnh	01
00613	Phường Tây Tựu	01
00619	Phường Phú Diễn	01
00622	Phường Xuân Phương	01
00634	Phường Tây Mỗ	01
00637	Phường Đại Mỗ	01
00640	Xã Thanh Trì	01
00643	Phường Thanh Liệt	01
00664	Xã Đại Thanh	01
00679	Xã Ngọc Hồi	01
00685	Xã Nam Phù	01
04930	Xã Yên Xuân	01
08974	Xã Quang Minh	01
08980	Xã Yên Lãng	01
08995	Xã Tiến Thắng	01
09022	Xã Mê Linh	01
09552	Phường Kiến Hưng	01
09556	Phường Hà Đông	01
09562	Phường Yên Nghĩa	01
09568	Phường Phú Lương	01
09574	Phường Sơn Tây	01
09604	Phường Tùng Thiện	01
09616	Xã Đoài Phương	01
09619	Xã Quảng Oai	01
09634	Xã Cổ Đô	01
09661	Xã Minh Châu	01
09664	Xã Vật Lại	01
09676	Xã Bất Bạt	01
09694	Xã Suối Hai	01
09700	Xã Ba Vì	01
09706	Xã Yên Bài	01
09715	Xã Phúc Thọ	01
09739	Xã Phúc Lộc	01
09772	Xã Hát Môn	01
09784	Xã Đan Phượng	01
09787	Xã Liên Minh	01
09817	Xã Ô Diên	01
09832	Xã Hoài Đức	01
09856	Xã Dương Hòa	01
09871	Xã Sơn Đồng	01
09877	Xã An Khánh	01
09886	Phường Dương Nội	01
09895	Xã Quốc Oai	01
09910	Xã Kiều Phú	01
09931	Xã Hưng Đạo	01
09952	Xã Phú Cát	01
09955	Xã Thạch Thất	01
09982	Xã Hạ Bằng	01
09988	Xã Hòa Lạc	01
10003	Xã Tây Phương	01
10015	Phường Chương Mỹ	01
10030	Xã Phú Nghĩa	01
10045	Xã Xuân Mai	01
10072	Xã Quảng Bị	01
10081	Xã Trần Phú	01
10096	Xã Hòa Phú	01
10114	Xã Thanh Oai	01
10126	Xã Bình Minh	01
10144	Xã Tam Hưng	01
10180	Xã Dân Hòa	01
10183	Xã Thường Tín	01
10210	Xã Hồng Vân	01
10231	Xã Thượng Phúc	01
10237	Xã Chương Dương	01
10273	Xã Phú Xuyên	01
10279	Xã Phượng Dực	01
10330	Xã Chuyên Mỹ	01
10342	Xã Đại Xuyên	01
10354	Xã Vân Đình	01
10369	Xã Ứng Thiên	01
10402	Xã Ứng Hòa	01
10417	Xã Hòa Xá	01
10441	Xã Mỹ Đức	01
10459	Xã Phúc Sơn	01
10465	Xã Hồng Sơn	01
10489	Xã Hương Sơn	01
01273	Phường Thục Phán	04
01279	Phường Nùng Trí Cao	04
01288	Phường Tân Giang	04
01290	Xã Bảo Lâm	04
01294	Xã Lý Bôn	04
01297	Xã Nam Quang	04
01304	Xã Quảng Lâm	04
01318	Xã Yên Thổ	04
01321	Xã Bảo Lạc	04
01324	Xã Cốc Pàng	04
01327	Xã Cô Ba	04
01336	Xã Khánh Xuân	04
01339	Xã Xuân Trường	04
01351	Xã Hưng Đạo	04
01354	Xã Huy Giáp	04
01360	Xã Sơn Lộ	04
01363	Xã Thông Nông	04
01366	Xã Cần Yên	04
01387	Xã Thanh Long	04
01392	Xã Trường Hà	04
01393	Xã Lũng Nặm	04
01414	Xã Tổng Cọt	04
01438	Xã Hà Quảng	04
01447	Xã Trà Lĩnh	04
01456	Xã Quang Hán	04
01465	Xã Quang Trung	04
01477	Xã Trùng Khánh	04
01489	Xã Đình Phong	04
01501	Xã Đàm Thủy	04
01525	Xã Đoài Dương	04
01537	Xã Lý Quốc	04
01552	Xã Quang Long	04
01558	Xã Hạ Lang	04
01561	Xã Vinh Quý	04
01576	Xã Quảng Uyên	04
01594	Xã Độc Lập	04
01618	Xã Hạnh Phúc	04
01636	Xã Bế Văn Đàn	04
01648	Xã Phục Hòa	04
01654	Xã Hòa An	04
01660	Xã Nam Tuấn	04
01699	Xã Nguyễn Huệ	04
01708	Xã Bạch Đằng	04
01726	Xã Nguyên Bình	04
01729	Xã Tĩnh Túc	04
01738	Xã Ca Thành	04
01747	Xã Minh Tâm	04
01768	Xã Phan Thanh	04
01774	Xã Tam Kim	04
01777	Xã Thành Công	04
01786	Xã Đông Khê	04
01789	Xã Canh Tân	04
01792	Xã Kim Đồng	04
01795	Xã Minh Khai	04
01807	Xã Thạch An	04
01822	Xã Đức Long	04
00691	Phường Hà Giang 2	08
00694	Phường Hà Giang 1	08
00700	Xã Ngọc Đường	08
00706	Xã Phú Linh	08
00715	Xã Lũng Cú	08
00721	Xã Đồng Văn	08
00733	Xã Sà Phìn	08
00745	Xã Phố Bảng	08
00763	Xã Lũng Phìn	08
00769	Xã Mèo Vạc	08
00778	Xã Sơn Vĩ	08
00787	Xã Sủng Máng	08
00802	Xã Khâu Vai	08
00808	Xã Tát Ngà	08
00817	Xã Niêm Sơn	08
00820	Xã Yên Minh	08
00829	Xã Thắng Mố	08
00832	Xã Bạch Đích	08
00847	Xã Mậu Duệ	08
00859	Xã Ngọc Long	08
00865	Xã Đường Thượng	08
00871	Xã Du Già	08
00874	Xã Quản Bạ	08
00883	Xã Cán Tỷ	08
00889	Xã Nghĩa Thuận	08
00892	Xã Tùng Vài	08
00901	Xã Lùng Tám	08
00913	Xã Vị Xuyên	08
00919	Xã Minh Tân	08
00922	Xã Thuận Hòa	08
00925	Xã Tùng Bá	08
00928	Xã Thanh Thủy	08
00937	Xã Lao Chải	08
00952	Xã Cao Bồ	08
00958	Xã Thượng Sơn	08
00967	Xã Việt Lâm	08
00970	Xã Linh Hồ	08
00976	Xã Bạch Ngọc	08
00982	Xã Minh Sơn	08
00985	Xã Giáp Trung	08
00991	Xã Bắc Mê	08
00994	Xã Minh Ngọc	08
01006	Xã Yên Cường	08
01012	Xã Đường Hồng	08
01021	Xã Hoàng Su Phì	08
01024	Xã Bản Máy	08
01033	Xã Thàng Tín	08
01051	Xã Tân Tiến	08
01057	Xã Pờ Ly Ngài	08
01075	Xã Nậm Dịch	08
01084	Xã Hồ Thầu	08
01090	Xã Thông Nguyên	08
01096	Xã Pà Vầy Sủ	08
01108	Xã Xín Mần	08
01117	Xã Trung Thịnh	08
01141	Xã Nấm Dẩn	08
01144	Xã Quảng Nguyên	08
01147	Xã Khuôn Lùng	08
01153	Xã Bắc Quang	08
01156	Xã Vĩnh Tuy	08
01165	Xã Đồng Tâm	08
01171	Xã Tân Quang	08
01180	Xã Bằng Hành	08
01192	Xã Liên Hiệp	08
01201	Xã Hùng An	08
01216	Xã Đồng Yên	08
01225	Xã Tiên Nguyên	08
01234	Xã Yên Thành	08
01237	Xã Quang Bình	08
01243	Xã Tân Trịnh	08
01246	Xã Bằng Lang	08
01255	Xã Xuân Giang	08
01261	Xã Tiên Yên	08
02212	Phường Nông Tiến	08
02215	Phường Minh Xuân	08
02221	Xã Nà Hang	08
02239	Xã Thượng Nông	08
02245	Xã Côn Lôn	08
02248	Xã Yên Hoa	08
02260	Xã Hồng Thái	08
02266	Xã Lâm Bình	08
02269	Xã Thượng Lâm	08
02287	Xã Chiêm Hóa	08
02296	Xã Bình An	08
02302	Xã Minh Quang	08
02305	Xã Trung Hà	08
02308	Xã Tân Mỹ	08
02317	Xã Yên Lập	08
02320	Xã Tân An	08
02332	Xã Kiên Đài	08
02350	Xã Kim Bình	08
02353	Xã Hòa An	08
02359	Xã Tri Phú	08
02365	Xã Yên Nguyên	08
02374	Xã Hàm Yên	08
02380	Xã Bạch Xa	08
02392	Xã Phù Lưu	08
02398	Xã Yên Phú	08
02404	Xã Bình Xa	08
02407	Xã Thái Sơn	08
02419	Xã Thái Hòa	08
02425	Xã Hùng Đức	08
02434	Xã Lực Hành	08
02437	Xã Kiến Thiết	08
02449	Xã Xuân Vân	08
02455	Xã Hùng Lợi	08
02458	Xã Trung Sơn	08
02470	Xã Tân Long	08
02473	Xã Yên Sơn	08
02494	Xã Thái Bình	08
02509	Phường Mỹ Lâm	08
02512	Phường An Tường	08
02524	Phường Bình Thuận	08
02530	Xã Nhữ Khê	08
02536	Xã Sơn Dương	08
02545	Xã Tân Trào	08
02548	Xã Bình Ca	08
02554	Xã Minh Thanh	08
02572	Xã Đông Thọ	08
02578	Xã Tân Thanh	08
02608	Xã Hồng Sơn	08
02611	Xã Phú Lương	08
02620	Xã Sơn Thủy	08
02623	Xã Trường Sinh	08
03127	Phường Điện Biên Phủ	11
03151	Phường Mường Lay	11
03158	Xã Sín Thầu	11
03160	Xã Mường Nhé	11
03162	Xã Nậm Kè	11
03163	Xã Mường Toong	11
03164	Xã Quảng Lâm	11
03166	Xã Mường Chà	11
03169	Xã Nà Hỳ	11
03172	Xã Na Sang	11
03175	Xã Chà Tở	11
03176	Xã Nà Bủng	11
03181	Xã Mường Tùng	11
03193	Xã Pa Ham	11
03194	Xã Nậm Nèn	11
03199	Xã Si Pa Phìn	11
03202	Xã Mường Pồn	11
03203	Xã Na Son	11
03208	Xã Xa Dung	11
03214	Xã Mường Luân	11
03217	Xã Tủa Chùa	11
03220	Xã Tủa Thàng	11
03226	Xã Sín Chải	11
03241	Xã Sính Phình	11
03244	Xã Sáng Nhè	11
03253	Xã Tuần Giáo	11
03256	Xã Mường Ảng	11
03260	Xã Pú Nhung	11
03268	Xã Mường Mùn	11
03283	Xã Chiềng Sinh	11
03295	Xã Quài Tở	11
03301	Xã Búng Lao	11
03313	Xã Mường Lạn	11
03316	Xã Nà Tấu	11
03325	Xã Mường Phăng	11
03328	Xã Thanh Nưa	11
03334	Phường Mường Thanh	11
03349	Xã Thanh Yên	11
03352	Xã Thanh An	11
03356	Xã Sam Mứn	11
03358	Xã Núa Ngam	11
03368	Xã Mường Nhà	11
03370	Xã Pu Nhi	11
03382	Xã Phình Giàng	11
03385	Xã Tìa Dình	11
03388	Phường Đoàn Kết	12
03390	Xã Bình Lư	12
03394	Xã Sin Suối Hồ	12
03405	Xã Tả Lèng	12
03408	Phường Tân Phong	12
03424	Xã Bản Bo	12
03430	Xã Khun Há	12
03433	Xã Bum Tở	12
03434	Xã Nậm Hàng	12
03439	Xã Thu Lũm	12
03442	Xã Pa Ủ	12
03445	Xã Mường Tè	12
03451	Xã Mù Cả	12
03460	Xã Hua Bum	12
03463	Xã Tà Tổng	12
03466	Xã Bum Nưa	12
03472	Xã Mường Mô	12
03478	Xã Sìn Hồ	12
03487	Xã Lê Lợi	12
03503	Xã Pa Tần	12
03508	Xã Hồng Thu	12
03517	Xã Nậm Tăm	12
03529	Xã Tủa Sín Chải	12
03532	Xã Pu Sam Cáp	12
03538	Xã Nậm Mạ	12
03544	Xã Nậm Cuổi	12
03549	Xã Phong Thổ	12
03562	Xã Sì Lở Lầu	12
03571	Xã Dào San	12
03583	Xã Khổng Lào	12
03595	Xã Than Uyên	12
03598	Xã Tân Uyên	12
03601	Xã Mường Khoa	12
03613	Xã Nậm Sỏ	12
03616	Xã Pắc Ta	12
03618	Xã Mường Than	12
03637	Xã Mường Kim	12
03640	Xã Khoen On	12
03646	Phường Tô Hiệu	14
03664	Phường Chiềng An	14
03670	Phường Chiềng Cơi	14
03679	Phường Chiềng Sinh	14
03688	Xã Mường Chiên	14
03694	Xã Mường Giôn	14
03703	Xã Quỳnh Nhai	14
03712	Xã Mường Sại	14
03721	Xã Thuận Châu	14
03724	Xã Bình Thuận	14
03727	Xã Mường É	14
03754	Xã Chiềng La	14
03757	Xã Mường Khiêng	14
03760	Xã Mường Bám	14
03763	Xã Long Hẹ	14
03781	Xã Co Mạ	14
03784	Xã Nậm Lầu	14
03799	Xã Muổi Nọi	14
03808	Xã Mường La	14
03814	Xã Chiềng Lao	14
03820	Xã Ngọc Chiến	14
03847	Xã Mường Bú	14
03850	Xã Chiềng Hoa	14
03856	Xã Bắc Yên	14
03862	Xã Xím Vàng	14
03868	Xã Tà Xùa	14
03871	Xã Pắc Ngà	14
03880	Xã Tạ Khoa	14
03892	Xã Chiềng Sại	14
03901	Xã Suối Tọ	14
03907	Xã Mường Cơi	14
03910	Xã Phù Yên	14
03922	Xã Gia Phù	14
03943	Xã Mường Bang	14
03958	Xã Tường Hạ	14
03961	Xã Kim Bon	14
03970	Xã Tân Phong	14
03979	Phường Mộc Sơn	14
03980	Phường Mộc Châu	14
03982	Phường Thảo Nguyên	14
03985	Xã Chiềng Sơn	14
03997	Xã Tân Yên	14
04000	Xã Đoàn Kết	14
04006	Xã Song Khủa	14
04018	Xã Tô Múa	14
04033	Phường Vân Sơn	14
04045	Xã Lóng Sập	14
04048	Xã Vân Hồ	14
04057	Xã Xuân Nha	14
04075	Xã Yên Châu	14
04078	Xã Chiềng Hặc	14
04087	Xã Yên Sơn	14
04096	Xã Lóng Phiêng	14
04099	Xã Phiêng Khoài	14
04105	Xã Mai Sơn	14
04108	Xã Chiềng Sung	14
04117	Xã Mường Chanh	14
04123	Xã Chiềng Mung	14
04132	Xã Chiềng Mai	14
04136	Xã Tà Hộc	14
04144	Xã Phiêng Cằm	14
04159	Xã Phiêng Pằn	14
04168	Xã Sông Mã	14
04171	Xã Bó Sinh	14
04183	Xã Mường Lầm	14
04186	Xã Nậm Ty	14
04195	Xã Chiềng Sơ	14
04204	Xã Chiềng Khoong	14
04210	Xã Huổi Một	14
04219	Xã Mường Hung	14
04222	Xã Chiềng Khương	14
04228	Xã Púng Bánh	14
04231	Xã Sốp Cộp	14
04240	Xã Mường Lèo	14
04246	Xã Mường Lạn	14
02647	Phường Lào Cai	15
02671	Phường Cam Đường	15
02680	Xã Hợp Thành	15
02683	Xã Bát Xát	15
02686	Xã A Mú Sung	15
02695	Xã Trịnh Tường	15
02701	Xã Y Tý	15
02707	Xã Dền Sáng	15
02725	Xã Bản Xèo	15
02728	Xã Mường Hum	15
02746	Xã Cốc San	15
02752	Xã Pha Long	15
02761	Xã Mường Khương	15
02782	Xã Cao Sơn	15
02788	Xã Bản Lầu	15
02809	Xã Si Ma Cai	15
02824	Xã Sín Chéng	15
02839	Xã Bắc Hà	15
02842	Xã Tả Củ Tỷ	15
02848	Xã Lùng Phình	15
02869	Xã Bản Liền	15
02890	Xã Bảo Nhai	15
02896	Xã Cốc Lầu	15
02902	Xã Phong Hải	15
02905	Xã Bảo Thắng	15
02908	Xã Tằng Loỏng	15
02923	Xã Gia Phú	15
02926	Xã Xuân Quang	15
02947	Xã Bảo Yên	15
02953	Xã Nghĩa Đô	15
02962	Xã Xuân Hòa	15
02968	Xã Thượng Hà	15
02989	Xã Bảo Hà	15
02998	Xã Phúc Khánh	15
03004	Xã Ngũ Chỉ Sơn	15
03006	Phường Sa Pa	15
03013	Xã Tả Phìn	15
03037	Xã Tả Van	15
03043	Xã Mường Bo	15
03046	Xã Bản Hồ	15
03061	Xã Võ Lao	15
03076	Xã Nậm Chày	15
03082	Xã Văn Bàn	15
03085	Xã Nậm Xé	15
03091	Xã Chiềng Ken	15
03103	Xã Khánh Yên	15
03106	Xã Dương Quỳ	15
03121	Xã Minh Lương	15
04252	Phường Yên Bái	15
04273	Phường Nam Cường	15
04279	Phường Văn Phú	15
04288	Phường Nghĩa Lộ	15
04303	Xã Lục Yên	15
04309	Xã Lâm Thượng	15
04336	Xã Tân Lĩnh	15
04342	Xã Khánh Hòa	15
04345	Xã Mường Lai	15
04363	Xã Phúc Lợi	15
04375	Xã Mậu A	15
04381	Xã Lâm Giang	15
04387	Xã Châu Quế	15
04399	Xã Đông Cuông	15
04402	Xã Phong Dụ Hạ	15
04423	Xã Phong Dụ Thượng	15
04429	Xã Tân Hợp	15
04441	Xã Xuân Ái	15
04450	Xã Mỏ Vàng	15
04456	Xã Mù Cang Chải	15
04462	Xã Nậm Có	15
04465	Xã Khao Mang	15
04474	Xã Lao Chải	15
04489	Xã Chế Tạo	15
04492	Xã Púng Luông	15
04498	Xã Trấn Yên	15
04531	Xã Quy Mông	15
04537	Xã Lương Thịnh	15
04543	Phường Âu Lâu	15
04564	Xã Việt Hồng	15
04576	Xã Hưng Khánh	15
04585	Xã Hạnh Phúc	15
04603	Xã Tà Xi Láng	15
04606	Xã Trạm Tấu	15
04609	Xã Phình Hồ	15
04630	Xã Tú Lệ	15
04636	Xã Gia Hội	15
04651	Xã Sơn Lương	15
04660	Xã Liên Sơn	15
04663	Phường Trung Tâm	15
04672	Xã Văn Chấn	15
04681	Phường Cầu Thia	15
04693	Xã Cát Thịnh	15
04699	Xã Chấn Thịnh	15
04705	Xã Thượng Bằng La	15
04711	Xã Nghĩa Tâm	15
04714	Xã Yên Bình	15
04717	Xã Thác Bà	15
04726	Xã Cảm Nhân	15
04744	Xã Yên Thành	15
04750	Xã Bảo Ái	15
01840	Phường Đức Xuân	19
01843	Phường Bắc Kạn	19
01849	Xã Phong Quang	19
01864	Xã Bằng Thành	19
01879	Xã Cao Minh	19
01882	Xã Nghiên Loan	19
01894	Xã Phúc Lộc	19
01906	Xã Ba Bể	19
01912	Xã Chợ Rã	19
01921	Xã Thượng Minh	19
01933	Xã Đồng Phúc	19
01936	Xã Nà Phặc	19
01942	Xã Bằng Vân	19
01954	Xã Ngân Sơn	19
01957	Xã Thượng Quan	19
01960	Xã Hiệp Lực	19
01969	Xã Phủ Thông	19
01981	Xã Vĩnh Thông	19
02008	Xã Cẩm Giàng	19
02014	Xã Bạch Thông	19
02020	Xã Chợ Đồn	19
02026	Xã Nam Cường	19
02038	Xã Quảng Bạch	19
02044	Xã Yên Thịnh	19
02071	Xã Nghĩa Tá	19
02083	Xã Yên Phong	19
02086	Xã Chợ Mới	19
02101	Xã Thanh Mai	19
02104	Xã Tân Kỳ	19
02107	Xã Thanh Thịnh	19
02116	Xã Yên Bình	19
02143	Xã Văn Lang	19
02152	Xã Cường Lợi	19
02155	Xã Na Rì	19
02176	Xã Trần Phú	19
02185	Xã Côn Minh	19
02191	Xã Xuân Dương	19
05443	Phường Phan Đình Phùng	19
05455	Phường Quyết Thắng	19
05467	Phường Gia Sàng	19
05482	Phường Quan Triều	19
05488	Xã Đại Phúc	19
05500	Phường Tích Lương	19
05503	Xã Tân Cương	19
05518	Phường Sông Công	19
05528	Phường Bách Quang	19
05533	Phường Bá Xuyên	19
05542	Xã Lam Vỹ	19
05551	Xã Kim Phượng	19
05563	Xã Phượng Tiến	19
05569	Xã Định Hóa	19
05581	Xã Trung Hội	19
05587	Xã Bình Yên	19
05602	Xã Phú Đình	19
05605	Xã Bình Thành	19
05611	Xã Phú Lương	19
05620	Xã Yên Trạch	19
05632	Xã Hợp Thành	19
05641	Xã Vô Tranh	19
05662	Xã Trại Cau	19
05665	Xã Văn Lăng	19
05674	Xã Quang Sơn	19
05680	Xã Văn Hán	19
05692	Xã Đồng Hỷ	19
05707	Xã Nam Hòa	19
05710	Phường Linh Sơn	19
05716	Xã Võ Nhai	19
05719	Xã Sảng Mộc	19
05722	Xã Nghinh Tường	19
05725	Xã Thần Sa	19
05740	Xã La Hiên	19
05746	Xã Tràng Xá	19
05755	Xã Dân Tiến	19
05773	Xã Phú Xuyên	19
05776	Xã Đức Lương	19
05788	Xã Phú Lạc	19
05800	Xã Phú Thịnh	19
05809	Xã An Khánh	19
05818	Xã La Bằng	19
05830	Xã Đại Từ	19
05845	Xã Vạn Phú	19
05851	Xã Quân Chu	19
05857	Phường Phúc Thuận	19
05860	Phường Phổ Yên	19
05881	Xã Thành Công	19
05890	Phường Vạn Xuân	19
05899	Phường Trung Thành	19
05908	Xã Phú Bình	19
05917	Xã Tân Khánh	19
05923	Xã Tân Thành	19
05941	Xã Điềm Thụy	19
05953	Xã Kha Sơn	19
05977	Phường Đông Kinh	20
05983	Phường Lương Văn Tri	20
05986	Phường Tam Thanh	20
06001	Xã Đoàn Kết	20
06004	Xã Quốc Khánh	20
06019	Xã Tân Tiến	20
06037	Xã Kháng Chiến	20
06040	Xã Thất Khê	20
06046	Xã Tràng Định	20
06058	Xã Quốc Việt	20
06073	Xã Hoa Thám	20
06076	Xã Quý Hòa	20
06079	Xã Hồng Phong	20
06085	Xã Thiện Hòa	20
06091	Xã Thiện Thuật	20
06103	Xã Thiện Long	20
06112	Xã Bình Gia	20
06115	Xã Tân Văn	20
06124	Xã Na Sầm	20
06148	Xã Thụy Hùng	20
06151	Xã Hội Hoan	20
06154	Xã Văn Lãng	20
06172	Xã Hoàng Văn Thụ	20
06184	Xã Đồng Đăng	20
06187	Phường Kỳ Lừa	20
06196	Xã Ba Sơn	20
06211	Xã Cao Lộc	20
06220	Xã Công Sơn	20
06253	Xã Văn Quan	20
06280	Xã Điềm He	20
06286	Xã Khánh Khê	20
06298	Xã Yên Phúc	20
06313	Xã Tri Lễ	20
06316	Xã Tân Đoàn	20
06325	Xã Bắc Sơn	20
06337	Xã Tân Tri	20
06349	Xã Hưng Vũ	20
06364	Xã Vũ Lễ	20
06367	Xã Vũ Lăng	20
06376	Xã Nhất Hòa	20
06385	Xã Hữu Lũng	20
06391	Xã Yên Bình	20
06400	Xã Hữu Liên	20
06415	Xã Vân Nham	20
06427	Xã Cai Kinh	20
06436	Xã Thiện Tân	20
06445	Xã Tân Thành	20
06457	Xã Tuấn Sơn	20
06463	Xã Chi Lăng	20
06475	Xã Bằng Mạc	20
06481	Xã Chiến Thắng	20
06496	Xã Nhân Lý	20
06505	Xã Vạn Linh	20
06517	Xã Quan Sơn	20
06526	Xã Na Dương	20
06529	Xã Lộc Bình	20
06541	Xã Mẫu Sơn	20
06565	Xã Khuất Xá	20
06577	Xã Thống Nhất	20
06601	Xã Lợi Bác	20
06607	Xã Xuân Dương	20
06613	Xã Đình Lập	20
06616	Xã Thái Bình	20
06625	Xã Kiên Mộc	20
06637	Xã Châu Sơn	20
06652	Phường Hà Tu	22
06658	Phường Cao Xanh	22
06661	Phường Việt Hưng	22
06673	Phường Bãi Cháy	22
06676	Phường Hà Lầm	22
06685	Phường Hồng Gai	22
06688	Phường Hạ Long	22
06706	Phường Tuần Châu	22
06709	Phường Móng Cái 2	22
06712	Phường Móng Cái 1	22
06724	Xã Hải Sơn	22
06733	Xã Hải Ninh	22
06736	Phường Móng Cái 3	22
06757	Xã Vĩnh Thực	22
06760	Phường Mông Dương	22
06778	Phường Quang Hanh	22
06781	Phường Cửa Ông	22
06793	Phường Cẩm Phả	22
06799	Xã Hải Hòa	22
06811	Phường Uông Bí	22
06820	Phường Vàng Danh	22
06832	Phường Yên Tử	22
06838	Xã Bình Liêu	22
06841	Xã Hoành Mô	22
06856	Xã Lục Hồn	22
06862	Xã Tiên Yên	22
06874	Xã Điền Xá	22
06877	Xã Đông Ngũ	22
06886	Xã Hải Lạng	22
06895	Xã Đầm Hà	22
06913	Xã Quảng Tân	22
06922	Xã Quảng Hà	22
06931	Xã Quảng Đức	22
06946	Xã Đường Hoa	22
06967	Xã Cái Chiên	22
06970	Xã Ba Chẽ	22
06979	Xã Kỳ Thượng	22
06985	Xã Lương Minh	22
06994	Đặc khu Vân Đồn	22
07030	Phường Hoành Bồ	22
07054	Xã Quảng La	22
07060	Xã Thống Nhất	22
07069	Phường Mạo Khê	22
07081	Phường Bình Khê	22
07090	Phường An Sinh	22
07093	Phường Đông Triều	22
07114	Phường Hoàng Quế	22
07132	Phường Quảng Yên	22
07135	Phường Đông Mai	22
07147	Phường Hiệp Hòa	22
07168	Phường Hà An	22
07180	Phường Liên Hòa	22
07183	Phường Phong Cốc	22
07192	Đặc khu Cô Tô	22
07210	Phường Bắc Giang	24
07228	Phường Đa Mai	24
07246	Xã Xuân Lương	24
07264	Xã Tam Tiến	24
07282	Xã Đồng Kỳ	24
07288	Xã Yên Thế	24
07294	Xã Bố Hạ	24
07306	Xã Nhã Nam	24
07330	Xã Phúc Hòa	24
07333	Xã Quang Trung	24
07339	Xã Tân Yên	24
07351	Xã Ngọc Thiện	24
07375	Xã Lạng Giang	24
07381	Xã Tiên Lục	24
07399	Xã Kép	24
07420	Xã Mỹ Thái	24
07432	Xã Tân Dĩnh	24
07444	Xã Lục Nam	24
07450	Xã Đông Phú	24
07462	Xã Bảo Đài	24
07486	Xã Nghĩa Phương	24
07489	Xã Trường Sơn	24
07492	Xã Lục Sơn	24
07498	Xã Bắc Lũng	24
07519	Xã Cẩm Lý	24
07525	Phường Chũ	24
07531	Xã Tân Sơn	24
07534	Xã Sa Lý	24
07537	Xã Biên Sơn	24
07543	Xã Sơn Hải	24
07552	Xã Kiên Lao	24
07573	Xã Biển Động	24
07582	Xã Lục Ngạn	24
07594	Xã Đèo Gia	24
07603	Xã Nam Dương	24
07612	Phường Phượng Sơn	24
07615	Xã Sơn Động	24
07616	Xã Tây Yên Tử	24
07621	Xã Vân Sơn	24
07627	Xã Đại Sơn	24
07642	Xã Yên Định	24
07654	Xã An Lạc	24
07663	Xã Tuấn Đạo	24
07672	Xã Dương Hưu	24
07681	Phường Yên Dũng	24
07682	Phường Tân An	24
07696	Phường Tiền Phong	24
07699	Phường Tân Tiến	24
07735	Xã Đồng Việt	24
07738	Phường Cảnh Thụy	24
07774	Phường Tự Lạn	24
07777	Phường Việt Yên	24
07795	Phường Nếnh	24
07798	Phường Vân Hà	24
07822	Xã Hoàng Vân	24
07840	Xã Hiệp Hòa	24
07864	Xã Hợp Thịnh	24
07870	Xã Xuân Cẩm	24
09169	Phường Vũ Ninh	24
09187	Phường Kinh Bắc	24
09190	Phường Võ Cường	24
09193	Xã Yên Phong	24
09202	Xã Tam Giang	24
09205	Xã Yên Trung	24
09208	Xã Tam Đa	24
09238	Xã Văn Môn	24
09247	Phường Quế Võ	24
09253	Phường Nhân Hòa	24
09265	Phường Phương Liễu	24
09286	Phường Nam Sơn	24
09292	Xã Phù Lãng	24
09295	Phường Bồng Lai	24
09301	Phường Đào Viên	24
09313	Xã Chi Lăng	24
09319	Xã Tiên Du	24
09325	Phường Hạp Lĩnh	24
09334	Xã Liên Bão	24
09340	Xã Đại Đồng	24
09343	Xã Tân Chi	24
09349	Xã Phật Tích	24
09367	Phường Từ Sơn	24
09370	Phường Tam Sơn	24
09379	Phường Phù Khê	24
09385	Phường Đồng Nguyên	24
09400	Phường Thuận Thành	24
09409	Phường Mão Điền	24
09427	Phường Trí Quả	24
09430	Phường Trạm Lộ	24
09433	Phường Song Liễu	24
09445	Phường Ninh Xá	24
09454	Xã Gia Bình	24
09466	Xã Cao Đức	24
09469	Xã Đại Lai	24
09475	Xã Nhân Thắng	24
09487	Xã Đông Cứu	24
09496	Xã Lương Tài	24
09499	Xã Trung Kênh	24
09523	Xã Trung Chính	24
09529	Xã Lâm Thao	24
04792	Phường Tân Hòa	25
04795	Phường Hòa Bình	25
04828	Phường Thống Nhất	25
04831	Xã Đà Bắc	25
04846	Xã Đức Nhàn	25
04849	Xã Tân Pheo	25
04873	Xã Quy Đức	25
04876	Xã Cao Sơn	25
04891	Xã Tiền Phong	25
04894	Phường Kỳ Sơn	25
04897	Xã Thịnh Minh	25
04924	Xã Lương Sơn	25
04960	Xã Liên Sơn	25
04978	Xã Kim Bôi	25
04990	Xã Nật Sơn	25
05014	Xã Mường Động	25
05047	Xã Cao Dương	25
05068	Xã Hợp Kim	25
05086	Xã Dũng Tiến	25
05089	Xã Cao Phong	25
05092	Xã Thung Nai	25
05116	Xã Mường Thàng	25
05128	Xã Tân Lạc	25
05134	Xã Mường Hoa	25
05152	Xã Vân Sơn	25
05158	Xã Mường Bi	25
05191	Xã Toàn Thắng	25
05200	Xã Mai Châu	25
05206	Xã Tân Mai	25
05212	Xã Pà Cò	25
05245	Xã Bao La	25
05251	Xã Mai Hạ	25
05266	Xã Lạc Sơn	25
05287	Xã Mường Vang	25
05290	Xã Nhân Nghĩa	25
05293	Xã Thượng Cốc	25
05305	Xã Yên Phú	25
05323	Xã Quyết Thắng	25
05329	Xã Ngọc Sơn	25
05347	Xã Đại Đồng	25
05353	Xã Yên Thủy	25
05362	Xã Lạc Lương	25
05386	Xã Yên Trị	25
05392	Xã Lạc Thủy	25
05395	Xã An Nghĩa	25
05425	Xã An Bình	25
07894	Phường Nông Trang	25
07900	Phường Việt Trì	25
07909	Phường Thanh Miếu	25
07918	Phường Vân Phú	25
07942	Phường Phú Thọ	25
07948	Phường Âu Cơ	25
07954	Phường Phong Châu	25
07969	Xã Đoan Hùng	25
07996	Xã Bằng Luân	25
07999	Xã Chí Đám	25
08023	Xã Tây Cốc	25
08038	Xã Chân Mộng	25
08053	Xã Hạ Hòa	25
08071	Xã Đan Thượng	25
08110	Xã Hiền Lương	25
08113	Xã Yên Kỳ	25
08134	Xã Văn Lang	25
08143	Xã Vĩnh Chân	25
08152	Xã Thanh Ba	25
08173	Xã Quảng Yên	25
08203	Xã Hoàng Cương	25
08209	Xã Đông Thành	25
08218	Xã Chí Tiên	25
08227	Xã Liên Minh	25
08230	Xã Phù Ninh	25
08236	Xã Phú Mỹ	25
08245	Xã Trạm Thản	25
08254	Xã Dân Chủ	25
08275	Xã Bình Phú	25
08290	Xã Yên Lập	25
08296	Xã Sơn Lương	25
08305	Xã Xuân Viên	25
08311	Xã Trung Sơn	25
08323	Xã Thượng Long	25
08338	Xã Minh Hòa	25
08341	Xã Cẩm Khê	25
08344	Xã Tiên Lương	25
08377	Xã Vân Bán	25
08398	Xã Phú Khê	25
08416	Xã Hùng Việt	25
08431	Xã Đồng Lương	25
08434	Xã Tam Nông	25
08443	Xã Hiền Quan	25
08467	Xã Vạn Xuân	25
08479	Xã Thọ Văn	25
08494	Xã Lâm Thao	25
08500	Xã Xuân Lũng	25
08515	Xã Hy Cương	25
08521	Xã Phùng Nguyên	25
08527	Xã Bản Nguyên	25
08542	Xã Thanh Sơn	25
08545	Xã Thu Cúc	25
08560	Xã Lai Đồng	25
08566	Xã Tân Sơn	25
08584	Xã Võ Miếu	25
08590	Xã Xuân Đài	25
08593	Xã Minh Đài	25
08611	Xã Văn Miếu	25
08614	Xã Cự Đồng	25
08620	Xã Long Cốc	25
08632	Xã Hương Cần	25
08635	Xã Khả Cửu	25
08656	Xã Yên Sơn	25
08662	Xã Đào Xá	25
08674	Xã Thanh Thủy	25
08686	Xã Tu Vũ	25
08707	Phường Vĩnh Yên	25
08716	Phường Vĩnh Phúc	25
08740	Phường Phúc Yên	25
08746	Phường Xuân Hòa	25
08761	Xã Lập Thạch	25
08770	Xã Hợp Lý	25
08773	Xã Yên Lãng	25
08782	Xã Hải Lựu	25
08788	Xã Thái Hòa	25
08812	Xã Liên Hòa	25
08824	Xã Tam Sơn	25
08842	Xã Tiên Lữ	25
08848	Xã Sông Lô	25
08866	Xã Sơn Đông	25
08869	Xã Tam Dương	25
08872	Xã Tam Dương Bắc	25
08896	Xã Hoàng An	25
08905	Xã Hội Thịnh	25
08911	Xã Tam Đảo	25
08914	Xã Đạo Trù	25
08923	Xã Đại Đình	25
08935	Xã Bình Nguyên	25
08944	Xã Bình Tuyền	25
08950	Xã Bình Xuyên	25
08971	Xã Xuân Lãng	25
09025	Xã Yên Lạc	25
09040	Xã Tề Lỗ	25
09043	Xã Tam Hồng	25
09052	Xã Nguyệt Đức	25
09064	Xã Liên Châu	25
09076	Xã Vĩnh Tường	25
09079	Xã Vĩnh An	25
09100	Xã Vĩnh Hưng	25
09106	Xã Vĩnh Thành	25
09112	Xã Thổ Tang	25
09154	Xã Vĩnh Phú	25
10507	Phường Thành Đông	31
10525	Phường Hải Dương	31
10532	Phường Lê Thanh Nghị	31
10537	Phường Tân Hưng	31
10543	Phường Việt Hòa	31
10546	Phường Chí Linh	31
10549	Phường Chu Văn An	31
10552	Phường Nguyễn Trãi	31
10570	Phường Trần Hưng Đạo	31
10573	Phường Trần Nhân Tông	31
10603	Phường Lê Đại Hành	31
10606	Xã Nam Sách	31
10615	Xã Hợp Tiến	31
10633	Xã Trần Phú	31
10642	Xã Thái Tân	31
10645	Xã An Phú	31
10660	Phường Ái Quốc	31
10675	Phường Kinh Môn	31
10678	Phường Bắc An Phụ	31
10705	Xã Nam An Phụ	31
10714	Phường Nhị Chiểu	31
10726	Phường Phạm Sư Mạnh	31
10729	Phường Trần Liễu	31
10744	Phường Nguyễn Đại Năng	31
10750	Xã Phú Thái	31
10756	Xã Lai Khê	31
10792	Xã An Thành	31
10804	Xã Kim Thành	31
10813	Xã Thanh Hà	31
10816	Xã Hà Bắc	31
10837	Phường Nam Đồng	31
10843	Xã Hà Nam	31
10846	Xã Hà Tây	31
10882	Xã Hà Đông	31
10888	Xã Cẩm Giang	31
10891	Phường Tứ Minh	31
10903	Xã Cẩm Giàng	31
10909	Xã Tuệ Tĩnh	31
10930	Xã Mao Điền	31
10945	Xã Kẻ Sặt	31
10966	Xã Bình Giang	31
10972	Xã Đường An	31
10993	Xã Thượng Hồng	31
10999	Xã Gia Lộc	31
11002	Phường Thạch Khôi	31
11020	Xã Yết Kiêu	31
11050	Xã Gia Phúc	31
11065	Xã Trường Tân	31
11074	Xã Tứ Kỳ	31
11086	Xã Đại Sơn	31
11113	Xã Tân Kỳ	31
11131	Xã Chí Minh	31
11140	Xã Lạc Phượng	31
11146	Xã Nguyên Giáp	31
11164	Xã Vĩnh Lại	31
11167	Xã Tân An	31
11203	Xã Ninh Giang	31
11218	Xã Hồng Châu	31
11224	Xã Khúc Thừa Dụ	31
11239	Xã Thanh Miện	31
11242	Xã Nguyễn Lương Bằng	31
11254	Xã Bắc Thanh Miện	31
11257	Xã Hải Hưng	31
11284	Xã Nam Thanh Miện	31
11311	Phường Hồng Bàng	31
11329	Phường Ngô Quyền	31
11359	Phường Gia Viên	31
11383	Phường Lê Chân	31
11407	Phường An Biên	31
11411	Phường Đông Hải	31
11413	Phường Hải An	31
11443	Phường Kiến An	31
11446	Phường Phù Liễn	31
11455	Phường Đồ Sơn	31
11473	Phường Bạch Đằng	31
11488	Phường Lưu Kiếm	31
11503	Xã Việt Khê	31
11506	Phường Lê Ích Mộc	31
11533	Phường Hòa Bình	31
11542	Phường Nam Triệu	31
11557	Phường Thiên Hương	31
11560	Phường Thủy Nguyên	31
11581	Phường An Dương	31
11593	Phường An Phong	31
11602	Phường Hồng An	31
11617	Phường An Hải	31
11629	Xã An Lão	31
11635	Xã An Trường	31
11647	Xã An Quang	31
11668	Xã An Khánh	31
11674	Xã An Hưng	31
11680	Xã Kiến Thụy	31
11689	Phường Hưng Đạo	31
11692	Phường Dương Kinh	31
11713	Xã Nghi Dương	31
11725	Xã Kiến Minh	31
11728	Xã Kiến Hưng	31
11737	Phường Nam Đồ Sơn	31
11749	Xã Kiến Hải	31
11755	Xã Tiên Lãng	31
11761	Xã Quyết Thắng	31
11779	Xã Tân Minh	31
11791	Xã Tiên Minh	31
11806	Xã Chấn Hưng	31
11809	Xã Hùng Thắng	31
11824	Xã Vĩnh Bảo	31
11836	Xã Vĩnh Thịnh	31
11842	Xã Vĩnh Thuận	31
11848	Xã Vĩnh Hòa	31
11875	Xã Vĩnh Hải	31
11887	Xã Vĩnh Am	31
11911	Xã Nguyễn Bỉnh Khiêm	31
11914	Đặc khu Cát Hải	31
11948	Đặc khu Bạch Long Vĩ	31
11953	Phường Phố Hiến	33
11977	Xã Tân Hưng	33
11980	Phường Hồng Châu	33
11983	Phường Sơn Nam	33
11992	Xã Lạc Đạo	33
11995	Xã Đại Đồng	33
12004	Xã Như Quỳnh	33
12019	Xã Văn Giang	33
12025	Xã Phụng Công	33
12031	Xã Nghĩa Trụ	33
12049	Xã Mễ Sở	33
12064	Xã Nguyễn Văn Linh	33
12070	Xã Hoàn Long	33
12073	Xã Yên Mỹ	33
12091	Xã Việt Yên	33
12103	Phường Mỹ Hào	33
12127	Phường Thượng Hồng	33
12133	Phường Đường Hào	33
12142	Xã Ân Thi	33
12148	Xã Phạm Ngũ Lão	33
12166	Xã Xuân Trúc	33
12184	Xã Nguyễn Trãi	33
12196	Xã Hồng Quang	33
12205	Xã Khoái Châu	33
12223	Xã Triệu Việt Vương	33
12238	Xã Việt Tiến	33
12247	Xã Châu Ninh	33
12271	Xã Chí Minh	33
12280	Xã Lương Bằng	33
12286	Xã Nghĩa Dân	33
12313	Xã Đức Hợp	33
12322	Xã Hiệp Cường	33
12337	Xã Hoàng Hoa Thám	33
12361	Xã Tiên Hoa	33
12364	Xã Tiên Lữ	33
12391	Xã Quang Hưng	33
12406	Xã Đoàn Đào	33
12424	Xã Tiên Tiến	33
12427	Xã Tống Trân	33
12452	Phường Trần Hưng Đạo	33
12454	Phường Trần Lãm	33
12466	Phường Vũ Phúc	33
12472	Xã Quỳnh Phụ	33
12499	Xã A Sào	33
12511	Xã Minh Thọ	33
12517	Xã Ngọc Lâm	33
12523	Xã Phụ Dực	33
12526	Xã Đồng Bằng	33
12532	Xã Nguyễn Du	33
12577	Xã Quỳnh An	33
12583	Xã Tân Tiến	33
12586	Xã Hưng Hà	33
12595	Xã Ngự Thiên	33
12613	Xã Long Hưng	33
12619	Xã Diên Hà	33
12631	Xã Thần Khê	33
12634	Xã Tiên La	33
12676	Xã Lê Quý Đôn	33
12685	Xã Hồng Minh	33
12688	Xã Đông Hưng	33
12694	Xã Bắc Đông Hưng	33
12700	Xã Bắc Tiên Hưng	33
12736	Xã Đông Tiên Hưng	33
12745	Xã Bắc Đông Quan	33
12754	Xã Tiên Hưng	33
12763	Xã Nam Tiên Hưng	33
12775	Xã Nam Đông Hưng	33
12793	Xã Đông Quan	33
12817	Phường Trà Lý	33
12826	Xã Thái Thụy	33
12850	Xã Tây Thụy Anh	33
12859	Xã Bắc Thụy Anh	33
12862	Xã Đông Thụy Anh	33
12865	Xã Thụy Anh	33
12904	Xã Nam Thụy Anh	33
12916	Xã Bắc Thái Ninh	33
12919	Xã Tây Thái Ninh	33
12922	Xã Thái Ninh	33
12943	Xã Đông Thái Ninh	33
12961	Xã Nam Thái Ninh	33
12970	Xã Tiền Hải	33
12988	Xã Đông Tiền Hải	33
13003	Xã Đồng Châu	33
13021	Xã Ái Quốc	33
13039	Xã Tây Tiền Hải	33
13057	Xã Nam Cường	33
13063	Xã Nam Tiền Hải	33
13066	Xã Hưng Phú	33
13075	Xã Kiến Xương	33
13093	Xã Trà Giang	33
13096	Xã Bình Nguyên	33
13120	Xã Lê Lợi	33
13132	Xã Quang Lịch	33
13141	Xã Vũ Quý	33
13159	Xã Hồng Vũ	33
13183	Xã Bình Thanh	33
13186	Xã Bình Định	33
13192	Xã Vũ Thư	33
13219	Xã Vạn Xuân	33
13222	Xã Thư Trì	33
13225	Phường Thái Bình	33
13246	Xã Tân Thuận	33
13264	Xã Thư Vũ	33
13279	Xã Vũ Tiên	33
13285	Phường Phủ Lý	37
13291	Phường Phù Vân	37
13318	Phường Châu Sơn	37
13324	Phường Duy Tiên	37
13330	Phường Duy Tân	37
13336	Phường Duy Hà	37
13348	Phường Đồng Văn	37
13363	Phường Tiên Sơn	37
13366	Phường Hà Nam	37
13384	Phường Kim Bảng	37
13393	Phường Lê Hồ	37
13396	Phường Nguyễn Úy	37
13402	Phường Kim Thanh	37
13420	Phường Tam Chúc	37
13435	Phường Lý Thường Kiệt	37
13444	Phường Liêm Tuyền	37
13456	Xã Liêm Hà	37
13474	Xã Tân Thanh	37
13483	Xã Thanh Bình	37
13489	Xã Thanh Lâm	37
13495	Xã Thanh Liêm	37
13501	Xã Bình Mỹ	37
13504	Xã Bình Lục	37
13531	Xã Bình Giang	37
13540	Xã Bình An	37
13558	Xã Bình Sơn	37
13573	Xã Lý Nhân	37
13579	Xã Bắc Lý	37
13591	Xã Nam Xang	37
13594	Xã Trần Thương	37
13597	Xã Vĩnh Trụ	37
13609	Xã Nhân Hà	37
13627	Xã Nam Lý	37
13669	Phường Nam Định	37
13684	Phường Thiên Trường	37
13693	Phường Đông A	37
13699	Phường Thành Nam	37
13708	Phường Mỹ Lộc	37
13741	Xã Vụ Bản	37
13750	Xã Minh Tân	37
13753	Xã Hiển Khánh	37
13777	Phường Trường Thi	37
13786	Xã Liên Minh	37
13795	Xã Ý Yên	37
13807	Xã Tân Minh	37
13822	Xã Phong Doanh	37
13834	Xã Vũ Dương	37
13864	Xã Vạn Thắng	37
13870	Xã Yên Cường	37
13879	Xã Yên Đồng	37
13891	Xã Nghĩa Hưng	37
13894	Xã Rạng Đông	37
13900	Xã Đồng Thịnh	37
13918	Xã Nghĩa Sơn	37
13927	Xã Hồng Phong	37
13939	Xã Quỹ Nhất	37
13957	Xã Nghĩa Lâm	37
13966	Xã Nam Trực	37
13972	Phường Vị Khê	37
13984	Phường Hồng Quang	37
13987	Xã Nam Hồng	37
14005	Xã Nam Ninh	37
14011	Xã Nam Minh	37
14014	Xã Nam Đồng	37
14026	Xã Cổ Lễ	37
14038	Xã Ninh Giang	37
14053	Xã Trực Ninh	37
14056	Xã Cát Thành	37
14062	Xã Quang Hưng	37
14071	Xã Minh Thái	37
14077	Xã Ninh Cường	37
14089	Xã Xuân Trường	37
14095	Xã Xuân Hồng	37
14104	Xã Xuân Giang	37
14122	Xã Xuân Hưng	37
14161	Xã Giao Minh	37
14167	Xã Giao Thủy	37
14179	Xã Giao Hưng	37
14182	Xã Giao Hòa	37
14194	Xã Giao Bình	37
14203	Xã Giao Phúc	37
14212	Xã Giao Ninh	37
14215	Xã Hải Hậu	37
14218	Xã Hải Tiến	37
14221	Xã Hải Thịnh	37
14236	Xã Hải Anh	37
14248	Xã Hải Hưng	37
14281	Xã Hải An	37
14287	Xã Hải Quang	37
14308	Xã Hải Xuân	37
14329	Phường Hoa Lư	37
14359	Phường Nam Hoa Lư	37
14362	Phường Tam Điệp	37
14365	Phường Trung Sơn	37
14371	Phường Yên Sơn	37
14389	Xã Gia Lâm	37
14401	Xã Gia Tường	37
14404	Xã Cúc Phương	37
14407	Xã Phú Sơn	37
14428	Xã Nho Quan	37
14434	Xã Thanh Sơn	37
14452	Xã Quỳnh Lưu	37
14458	Xã Phú Long	37
14464	Xã Gia Viễn	37
14482	Xã Gia Hưng	37
14488	Xã Gia Vân	37
14494	Xã Gia Trấn	37
14500	Xã Đại Hoàng	37
14524	Xã Gia Phong	37
14533	Phường Tây Hoa Lư	37
14560	Xã Yên Khánh	37
14563	Xã Khánh Thiện	37
14566	Phường Đông Hoa Lư	37
14608	Xã Khánh Trung	37
14611	Xã Khánh Nhạc	37
14614	Xã Khánh Hội	37
14620	Xã Phát Diệm	37
14623	Xã Bình Minh	37
14638	Xã Kim Sơn	37
14647	Xã Quang Thiện	37
14653	Xã Chất Bình	37
14674	Xã Lai Thành	37
14677	Xã Định Hóa	37
14698	Xã Kim Đông	37
14701	Xã Yên Mô	37
14725	Phường Yên Thắng	37
14728	Xã Yên Từ	37
14743	Xã Yên Mạc	37
14746	Xã Đồng Thái	37
14758	Phường Hàm Rồng	38
14797	Phường Hạc Thành	38
14812	Phường Bỉm Sơn	38
14818	Phường Quang Trung	38
14845	Xã Mường Lát	38
14848	Xã Tam Chung	38
14854	Xã Mường Lý	38
14857	Xã Trung Lý	38
14860	Xã Quang Chiểu	38
14863	Xã Pù Nhi	38
14864	Xã Nhi Sơn	38
14866	Xã Mường Chanh	38
14869	Xã Hồi Xuân	38
14872	Xã Trung Thành	38
14875	Xã Trung Sơn	38
14878	Xã Phú Lệ	38
14890	Xã Phú Xuân	38
14896	Xã Hiền Kiệt	38
14902	Xã Nam Xuân	38
14908	Xã Thiên Phủ	38
14923	Xã Bá Thước	38
14932	Xã Điền Quang	38
14950	Xã Điền Lư	38
14953	Xã Quý Lương	38
14956	Xã Pù Luông	38
14959	Xã Cổ Lũng	38
14974	Xã Văn Nho	38
14980	Xã Thiết Ống	38
15001	Xã Trung Hạ	38
15007	Xã Tam Thanh	38
15010	Xã Sơn Thủy	38
15013	Xã Na Mèo	38
15016	Xã Quan Sơn	38
15019	Xã Tam Lư	38
15022	Xã Sơn Điện	38
15025	Xã Mường Mìn	38
15031	Xã Yên Khương	38
15034	Xã Yên Thắng	38
15043	Xã Giao An	38
15049	Xã Văn Phú	38
15055	Xã Linh Sơn	38
15058	Xã Đồng Lương	38
15061	Xã Ngọc Lặc	38
15085	Xã Thạch Lập	38
15091	Xã Ngọc Liên	38
15106	Xã Nguyệt Ấn	38
15112	Xã Kiên Thọ	38
15124	Xã Minh Sơn	38
15127	Xã Cẩm Thủy	38
15142	Xã Cẩm Thạch	38
15148	Xã Cẩm Tú	38
15163	Xã Cẩm Vân	38
15178	Xã Cẩm Tân	38
15187	Xã Kim Tân	38
15190	Xã Vân Du	38
15199	Xã Thạch Quảng	38
15211	Xã Thạch Bình	38
15229	Xã Thành Vinh	38
15250	Xã Ngọc Trạo	38
15271	Xã Hà Trung	38
15274	Xã Hà Long	38
15286	Xã Hoạt Giang	38
15298	Xã Lĩnh Toại	38
15316	Xã Tống Sơn	38
15349	Xã Vĩnh Lộc	38
15361	Xã Tây Đô	38
15382	Xã Biện Thượng	38
15409	Xã Yên Phú	38
15412	Xã Quý Lộc	38
15421	Xã Yên Trường	38
15442	Xã Yên Ninh	38
15448	Xã Định Hòa	38
15457	Xã Định Tân	38
15469	Xã Yên Định	38
15499	Xã Thọ Xuân	38
15505	Xã Thọ Long	38
15520	Xã Xuân Hòa	38
15544	Xã Lam Sơn	38
15553	Xã Sao Vàng	38
15568	Xã Thọ Lập	38
15574	Xã Xuân Tín	38
15592	Xã Xuân Lập	38
15607	Xã Bát Mọt	38
15610	Xã Yên Nhân	38
15622	Xã Vạn Xuân	38
15628	Xã Lương Sơn	38
15634	Xã Luận Thành	38
15643	Xã Thắng Lộc	38
15646	Xã Thường Xuân	38
15658	Xã Xuân Chinh	38
15661	Xã Tân Thành	38
15664	Xã Triệu Sơn	38
15667	Xã Thọ Bình	38
15682	Xã Hợp Tiến	38
15715	Xã Tân Ninh	38
15724	Xã Đồng Tiến	38
15754	Xã Thọ Ngọc	38
15763	Xã Thọ Phú	38
15766	Xã An Nông	38
15772	Xã Thiệu Hóa	38
15778	Xã Thiệu Tiến	38
15796	Xã Thiệu Quang	38
15820	Xã Thiệu Toán	38
15835	Xã Thiệu Trung	38
15853	Phường Đông Tiến	38
15865	Xã Hoằng Hóa	38
15880	Xã Hoằng Giang	38
15889	Xã Hoằng Phú	38
15910	Xã Hoằng Sơn	38
15925	Phường Nguyệt Viên	38
15961	Xã Hoằng Lộc	38
15976	Xã Hoằng Châu	38
15991	Xã Hoằng Tiến	38
16000	Xã Hoằng Thanh	38
16012	Xã Hậu Lộc	38
16021	Xã Triệu Lộc	38
16033	Xã Đông Thành	38
16072	Xã Hoa Lộc	38
16078	Xã Vạn Lộc	38
16093	Xã Nga Sơn	38
16108	Xã Tân Tiến	38
16114	Xã Nga Thắng	38
16138	Xã Hồ Vương	38
16144	Xã Nga An	38
16171	Xã Ba Đình	38
16174	Xã Như Xuân	38
16177	Xã Xuân Bình	38
16186	Xã Hóa Quỳ	38
16213	Xã Thanh Phong	38
16222	Xã Thanh Quân	38
16225	Xã Thượng Ninh	38
16228	Xã Như Thanh	38
16234	Xã Xuân Du	38
16249	Xã Mậu Lâm	38
16258	Xã Xuân Thái	38
16264	Xã Yên Thọ	38
16273	Xã Thanh Kỳ	38
16279	Xã Nông Cống	38
16297	Xã Trung Chính	38
16309	Xã Thắng Lợi	38
16342	Xã Thăng Bình	38
16348	Xã Trường Văn	38
16363	Xã Tượng Lĩnh	38
16369	Xã Công Chính	38
16378	Phường Đông Sơn	38
16417	Phường Đông Quang	38
16438	Xã Lưu Vệ	38
16480	Xã Quảng Yên	38
16489	Xã Quảng Chính	38
16498	Xã Quảng Ngọc	38
16516	Phường Nam Sầm Sơn	38
16522	Phường Quảng Phú	38
16531	Phường Sầm Sơn	38
16540	Xã Quảng Ninh	38
16543	Xã Quảng Bình	38
16549	Xã Tiên Trang	38
16561	Phường Tĩnh Gia	38
16576	Phường Ngọc Sơn	38
16591	Xã Các Sơn	38
16594	Phường Tân Dân	38
16597	Phường Hải Lĩnh	38
16609	Phường Đào Duy Từ	38
16624	Phường Trúc Lâm	38
16636	Xã Trường Lâm	38
16645	Phường Hải Bình	38
16654	Phường Nghi Sơn	38
16681	Phường Thành Vinh	40
16690	Phường Trường Vinh	40
16702	Phường Vinh Phú	40
16708	Phường Vinh Lộc	40
16732	Phường Cửa Lò	40
16738	Xã Quế Phong	40
16744	Xã Thông Thụ	40
16750	Xã Tiền Phong	40
16756	Xã Tri Lễ	40
16774	Xã Mường Quàng	40
16777	Xã Quỳ Châu	40
16792	Xã Châu Tiến	40
16801	Xã Hùng Chân	40
16804	Xã Châu Bình	40
16813	Xã Mường Xén	40
16816	Xã Mỹ Lý	40
16819	Xã Bắc Lý	40
16822	Xã Keng Đu	40
16828	Xã Huồi Tụ	40
16831	Xã Mường Lống	40
16834	Xã Na Loi	40
16837	Xã Nậm Cắn	40
16849	Xã Hữu Kiệm	40
16855	Xã Chiêu Lưu	40
16858	Xã Mường Típ	40
16870	Xã Na Ngoi	40
16876	Xã Tương Dương	40
16882	Xã Nhôn Mai	40
16885	Xã Hữu Khuông	40
16903	Xã Nga My	40
16906	Xã Lượng Minh	40
16909	Xã Yên Hòa	40
16912	Xã Yên Na	40
16933	Xã Tam Quang	40
16936	Xã Tam Thái	40
16939	Phường Thái Hòa	40
16941	Xã Nghĩa Đàn	40
16951	Xã Nghĩa Lâm	40
16969	Xã Nghĩa Thọ	40
16972	Xã Nghĩa Hưng	40
16975	Xã Nghĩa Mai	40
17011	Phường Tây Hiếu	40
17017	Xã Đông Hiếu	40
17029	Xã Nghĩa Lộc	40
17032	Xã Nghĩa Khánh	40
17035	Xã Quỳ Hợp	40
17044	Xã Châu Hồng	40
17056	Xã Châu Lộc	40
17059	Xã Tam Hợp	40
17071	Xã Minh Hợp	40
17077	Xã Mường Ham	40
17089	Xã Mường Chọng	40
17110	Phường Hoàng Mai	40
17125	Phường Quỳnh Mai	40
17128	Phường Tân Mai	40
17143	Xã Quỳnh Văn	40
17149	Xã Quỳnh Tam	40
17170	Xã Quỳnh Sơn	40
17176	Xã Quỳnh Anh	40
17179	Xã Quỳnh Lưu	40
17212	Xã Quỳnh Phú	40
17224	Xã Quỳnh Thắng	40
17230	Xã Bình Chuẩn	40
17239	Xã Mậu Thạch	40
17242	Xã Cam Phục	40
17248	Xã Châu Khê	40
17254	Xã Con Cuông	40
17263	Xã Môn Sơn	40
17266	Xã Tân Kỳ	40
17272	Xã Tân Phú	40
17278	Xã Giai Xuân	40
17284	Xã Nghĩa Đồng	40
17287	Xã Tiên Đồng	40
17305	Xã Tân An	40
17326	Xã Nghĩa Hành	40
17329	Xã Anh Sơn	40
17335	Xã Thành Bình Thọ	40
17344	Xã Nhân Hòa	40
17357	Xã Vĩnh Tường	40
17365	Xã Anh Sơn Đông	40
17380	Xã Yên Xuân	40
17395	Xã Hùng Châu	40
17416	Xã Đức Châu	40
17419	Xã Hải Châu	40
17443	Xã Quảng Châu	40
17464	Xã Diễn Châu	40
17476	Xã Minh Châu	40
17479	Xã An Châu	40
17488	Xã Tân Châu	40
17506	Xã Yên Thành	40
17515	Xã Bình Minh	40
17521	Xã Quang Đồng	40
17524	Xã Giai Lạc	40
17530	Xã Đông Thành	40
17560	Xã Vân Du	40
17569	Xã Quan Thành	40
17605	Xã Hợp Minh	40
17611	Xã Vân Tụ	40
17623	Xã Bạch Ngọc	40
17641	Xã Lương Sơn	40
17662	Xã Đô Lương	40
17677	Xã Văn Hiến	40
17689	Xã Thuần Trung	40
17707	Xã Bạch Hà	40
17713	Xã Đại Đồng	40
17722	Xã Hạnh Lâm	40
17728	Xã Cát Ngạn	40
17743	Xã Tam Đồng	40
17759	Xã Sơn Lâm	40
17770	Xã Hoa Quân	40
17779	Xã Xuân Lâm	40
17791	Xã Kim Bảng	40
17818	Xã Bích Hào	40
17827	Xã Nghi Lộc	40
17833	Xã Hải Lộc	40
17842	Xã Thần Lĩnh	40
17854	Xã Văn Kiều	40
17857	Xã Phúc Lộc	40
17866	Xã Trung Lộc	40
17878	Xã Đông Lộc	40
17920	Phường Vinh Hưng	40
17935	Xã Nam Đàn	40
17944	Xã Đại Huệ	40
17950	Xã Vạn An	40
17971	Xã Kim Liên	40
17989	Xã Thiên Nhẫn	40
18001	Xã Hưng Nguyên	40
18007	Xã Yên Trung	40
18028	Xã Hưng Nguyên Nam	40
18040	Xã Lam Thành	40
18073	Phường Thành Sen	42
18100	Phường Trần Phú	42
18115	Phường Bắc Hồng Lĩnh	42
18118	Phường Nam Hồng Lĩnh	42
18133	Xã Hương Sơn	42
18160	Xã Sơn Hồng	42
18163	Xã Sơn Tiến	42
18172	Xã Sơn Tây	42
18184	Xã Sơn Giang	42
18196	Xã Sơn Kim 1	42
18199	Xã Sơn Kim 2	42
18202	Xã Tứ Mỹ	42
18223	Xã Kim Hoa	42
18229	Xã Đức Thọ	42
18244	Xã Đức Minh	42
18262	Xã Đức Quang	42
18277	Xã Đức Thịnh	42
18304	Xã Đức Đồng	42
18313	Xã Vũ Quang	42
18322	Xã Mai Hoa	42
18328	Xã Thượng Đức	42
18352	Xã Nghi Xuân	42
18364	Xã Đan Hải	42
18373	Xã Tiên Điền	42
18394	Xã Cổ Đạm	42
18406	Xã Can Lộc	42
18409	Xã Hồng Lộc	42
18418	Xã Tùng Lộc	42
18436	Xã Trường Lưu	42
18466	Xã Gia Hanh	42
18481	Xã Xuân Lộc	42
18484	Xã Đồng Lộc	42
18496	Xã Hương Khê	42
18502	Xã Hà Linh	42
18523	Xã Hương Bình	42
18532	Xã Hương Phố	42
18544	Xã Hương Xuân	42
18547	Xã Phúc Trạch	42
18550	Xã Hương Đô	42
18562	Xã Thạch Hà	42
18568	Xã Lộc Hà	42
18583	Xã Mai Phụ	42
18586	Xã Đông Kinh	42
18601	Xã Việt Xuyên	42
18604	Xã Thạch Khê	42
18619	Xã Đồng Tiến	42
18628	Xã Thạch Lạc	42
18634	Xã Toàn Lưu	42
18652	Phường Hà Huy Tập	42
18667	Xã Thạch Xuân	42
18673	Xã Cẩm Xuyên	42
18676	Xã Thiên Cầm	42
18682	Xã Yên Hòa	42
18685	Xã Cẩm Bình	42
18736	Xã Cẩm Hưng	42
18739	Xã Cẩm Duệ	42
18742	Xã Cẩm Trung	42
18748	Xã Cẩm Lạc	42
18754	Phường Sông Trí	42
18766	Xã Kỳ Xuân	42
18775	Xã Kỳ Anh	42
18781	Phường Hải Ninh	42
18787	Xã Kỳ Văn	42
18790	Xã Kỳ Khang	42
18814	Xã Kỳ Hoa	42
18823	Phường Vũng Áng	42
18832	Phường Hoành Sơn	42
18838	Xã Kỳ Lạc	42
18844	Xã Kỳ Thượng	42
18859	Phường Đồng Thuận	44
18871	Phường Đồng Sơn	44
18880	Phường Đồng Hới	44
18901	Xã Minh Hóa	44
18904	Xã Dân Hóa	44
18919	Xã Tân Thành	44
18922	Xã Kim Điền	44
18943	Xã Kim Phú	44
18949	Xã Đồng Lê	44
18952	Xã Tuyên Sơn	44
18958	Xã Tuyên Lâm	44
18985	Xã Tuyên Phú	44
18991	Xã Tuyên Bình	44
18997	Xã Tuyên Hóa	44
19009	Phường Ba Đồn	44
19021	Xã Phú Trạch	44
19030	Xã Trung Thuần	44
19033	Xã Hòa Trạch	44
19051	Xã Tân Gianh	44
19057	Xã Quảng Trạch	44
19066	Phường Bắc Gianh	44
19075	Xã Nam Ba Đồn	44
19093	Xã Nam Gianh	44
19111	Xã Hoàn Lão	44
19126	Xã Bắc Trạch	44
19138	Xã Phong Nha	44
19141	Xã Bố Trạch	44
19147	Xã Thượng Trạch	44
19159	Xã Đông Trạch	44
19198	Xã Nam Trạch	44
19204	Xã Trường Sơn	44
19207	Xã Quảng Ninh	44
19225	Xã Ninh Châu	44
19237	Xã Trường Ninh	44
19246	Xã Lệ Ninh	44
19249	Xã Lệ Thủy	44
19255	Xã Cam Hồng	44
19288	Xã Sen Ngư	44
19291	Xã Tân Mỹ	44
19309	Xã Trường Phú	44
19318	Xã Kim Ngân	44
19333	Phường Đông Hà	44
19351	Phường Nam Đông Hà	44
19360	Phường Quảng Trị	44
19363	Xã Vĩnh Linh	44
19366	Xã Bến Quan	44
19372	Xã Vĩnh Hoàng	44
19405	Xã Vĩnh Thủy	44
19414	Xã Cửa Tùng	44
19429	Xã Khe Sanh	44
19432	Xã Lao Bảo	44
19435	Xã Hướng Lập	44
19441	Xã Hướng Phùng	44
19462	Xã Tân Lập	44
19483	Xã A Dơi	44
19489	Xã Lìa	44
19495	Xã Gio Linh	44
19496	Xã Cửa Việt	44
19501	Xã Bến Hải	44
19537	Xã Cồn Tiên	44
19555	Xã Hướng Hiệp	44
19564	Xã Đakrông	44
19567	Xã Ba Lòng	44
19588	Xã Tà Rụt	44
19594	Xã La Lay	44
19597	Xã Cam Lộ	44
19603	Xã Hiếu Giang	44
19624	Xã Triệu Phong	44
19639	Xã Nam Cửa Việt	44
19645	Xã Triệu Bình	44
19654	Xã Triệu Cơ	44
19669	Xã Ái Tử	44
19681	Xã Diên Sanh	44
19699	Xã Vĩnh Định	44
19702	Xã Hải Lăng	44
19735	Xã Nam Hải Lăng	44
19741	Xã Mỹ Thủy	44
19742	Đặc khu Cồn Cỏ	44
19753	Phường Phú Xuân	46
19774	Phường Kim Long	46
19777	Phường Vỹ Dạ	46
19789	Phường Thuận Hóa	46
19804	Phường Hương An	46
19813	Phường Thủy Xuân	46
19815	Phường An Cựu	46
19819	Phường Phong Điền	46
19828	Phường Phong Phú	46
19831	Phường Phong Dinh	46
19858	Phường Phong Thái	46
19867	Xã Quảng Điền	46
19873	Phường Phong Quảng	46
19885	Xã Đan Điền	46
19900	Phường Thuận An	46
19909	Phường Dương Nỗ	46
19918	Xã Phú Hồ	46
19930	Phường Mỹ Thượng	46
19942	Xã Phú Vang	46
19945	Xã Phú Vinh	46
19960	Phường Phú Bài	46
19969	Phường Thanh Thủy	46
19975	Phường Hương Thủy	46
19996	Phường Hương Trà	46
20014	Phường Hóa Châu	46
20017	Phường Kim Trà	46
20035	Xã Bình Điền	46
20044	Xã A Lưới 2	46
20050	Xã A Lưới 5	46
20056	Xã A Lưới 1	46
20071	Xã A Lưới 3	46
20101	Xã A Lưới 4	46
20107	Xã Phú Lộc	46
20122	Xã Vinh Lộc	46
20131	Xã Hưng Lộc	46
20137	Xã Chân Mây - Lăng Cô	46
20140	Xã Lộc An	46
20161	Xã Khe Tre	46
20179	Xã Nam Đông	46
20182	Xã Long Quảng	46
20194	Phường Hải Vân	48
20197	Phường Liên Chiểu	48
20200	Phường Hòa Khánh	48
20209	Phường Thanh Khê	48
20242	Phường Hải Châu	48
20257	Phường Hòa Cường	48
20260	Phường Cẩm Lệ	48
20263	Phường Sơn Trà	48
20275	Phường An Hải	48
20285	Phường Ngũ Hành Sơn	48
20305	Phường An Khê	48
20308	Xã Bà Nà	48
20314	Phường Hòa Xuân	48
20320	Xã Hòa Vang	48
20332	Xã Hòa Tiến	48
20333	Đặc khu Hoàng Sa	48
20335	Phường Bàn Thạch	48
20341	Phường Tam Kỳ	48
20350	Phường Hương Trà	48
20356	Phường Quảng Phú	48
20364	Xã Chiên Đàn	48
20380	Xã Tây Hồ	48
20392	Xã Phú Ninh	48
20401	Phường Hội An Tây	48
20410	Phường Hội An	48
20413	Phường Hội An Đông	48
20434	Xã Tân Hiệp	48
20443	Xã Hùng Sơn	48
20455	Xã Tây Giang	48
20458	Xã Avương	48
20467	Xã Đông Giang	48
20476	Xã Sông Kôn	48
20485	Xã Sông Vàng	48
20494	Xã Bến Hiên	48
20500	Xã Đại Lộc	48
20506	Xã Thượng Đức	48
20515	Xã Hà Nha	48
20539	Xã Vu Gia	48
20542	Xã Phú Thuận	48
20551	Phường Điện Bàn	48
20557	Phường Điện Bàn Bắc	48
20569	Xã Điện Bàn Tây	48
20575	Phường An Thắng	48
20579	Phường Điện Bàn Đông	48
20587	Xã Gò Nổi	48
20599	Xã Nam Phước	48
20611	Xã Thu Bồn	48
20623	Xã Duy Xuyên	48
20635	Xã Duy Nghĩa	48
20641	Xã Quế Sơn	48
20650	Xã Xuân Phú	48
20656	Xã Nông Sơn	48
20662	Xã Quế Sơn Trung	48
20669	Xã Quế Phước	48
20695	Xã Thạnh Mỹ	48
20698	Xã La Êê	48
20704	Xã La Dêê	48
20707	Xã Nam Giang	48
20710	Xã Bến Giằng	48
20716	Xã Đắc Pring	48
20722	Xã Khâm Đức	48
20728	Xã Phước Hiệp	48
20734	Xã Phước Năng	48
20740	Xã Phước Chánh	48
20752	Xã Phước Thành	48
20767	Xã Việt An	48
20770	Xã Phước Trà	48
20779	Xã Hiệp Đức	48
20791	Xã Thăng Bình	48
20794	Xã Thăng An	48
20818	Xã Đồng Dương	48
20827	Xã Thăng Phú	48
20836	Xã Thăng Trường	48
20848	Xã Thăng Điền	48
20854	Xã Tiên Phước	48
20857	Xã Sơn Cẩm Hà	48
20875	Xã Lãnh Ngọc	48
20878	Xã Thạnh Bình	48
20900	Xã Trà My	48
20908	Xã Trà Liên	48
20920	Xã Trà Đốc	48
20923	Xã Trà Tân	48
20929	Xã Trà Giáp	48
20938	Xã Trà Leng	48
20941	Xã Trà Tập	48
20944	Xã Nam Trà My	48
20950	Xã Trà Linh	48
20959	Xã Trà Vân	48
20965	Xã Núi Thành	48
20971	Xã Tam Xuân	48
20977	Xã Đức Phú	48
20984	Xã Tam Anh	48
20992	Xã Tam Hải	48
21004	Xã Tam Mỹ	48
21025	Phường Cẩm Thành	51
21028	Phường Nghĩa Lộ	51
21034	Xã An Phú	51
21040	Xã Bình Sơn	51
21061	Xã Vạn Tường	51
21085	Xã Bình Minh	51
21100	Xã Bình Chương	51
21109	Xã Đông Sơn	51
21115	Xã Trà Bồng	51
21124	Xã Thanh Bồng	51
21127	Xã Đông Trà Bồng	51
21136	Xã Cà Đam	51
21154	Xã Tây Trà	51
21157	Xã Tây Trà Bồng	51
21172	Phường Trương Quang Trọng	51
21181	Xã Thọ Phong	51
21196	Xã Trường Giang	51
21205	Xã Ba Gia	51
21211	Xã Tịnh Khê	51
21220	Xã Sơn Tịnh	51
21235	Xã Tư Nghĩa	51
21238	Xã Vệ Giang	51
21244	Xã Trà Giang	51
21250	Xã Nghĩa Giang	51
21289	Xã Sơn Hà	51
21292	Xã Sơn Hạ	51
21307	Xã Sơn Linh	51
21319	Xã Sơn Thủy	51
21325	Xã Sơn Kỳ	51
21334	Xã Sơn Tây Thượng	51
21340	Xã Sơn Tây	51
21343	Xã Sơn Tây Hạ	51
21349	Xã Sơn Mai	51
21361	Xã Minh Long	51
21364	Xã Nghĩa Hành	51
21370	Xã Phước Giang	51
21385	Xã Đình Cương	51
21388	Xã Thiện Tín	51
21400	Xã Mộ Đức	51
21409	Xã Long Phụng	51
21421	Xã Mỏ Cày	51
21433	Xã Lân Phong	51
21439	Phường Đức Phổ	51
21451	Phường Trà Câu	51
21457	Xã Nguyễn Nghiêm	51
21472	Xã Khánh Cường	51
21478	Phường Sa Huỳnh	51
21484	Xã Ba Tơ	51
21490	Xã Ba Vinh	51
21496	Xã Ba Động	51
21499	Xã Ba Dinh	51
21520	Xã Đặng Thùy Trâm	51
21523	Xã Ba Tô	51
21529	Xã Ba Vì	51
21538	Xã Ba Xa	51
21548	Đặc khu Lý Sơn	51
23284	Phường Đăk Cấm	51
23293	Phường Kon Tum	51
23302	Phường Đăk Bla	51
23317	Xã Ngọk Bay	51
23326	Xã Ia Chim	51
23332	Xã Đăk Rơ Wa	51
23341	Xã Đăk Pék	51
23344	Xã Đăk Plô	51
23356	Xã Xốp	51
23365	Xã Ngọc Linh	51
23368	Xã Đăk Long	51
23374	Xã Đăk Môn	51
23377	Xã Bờ Y	51
23383	Xã Dục Nông	51
23392	Xã Sa Loong	51
23401	Xã Đăk Tô	51
23416	Xã Đăk Sao	51
23419	Xã Đăk Tờ Kan	51
23425	Xã Tu Mơ Rông	51
23428	Xã Ngọk Tụ	51
23430	Xã Kon Đào	51
23446	Xã Măng Ri	51
23455	Xã Măng Bút	51
23473	Xã Măng Đen	51
23476	Xã Kon Plông	51
23479	Xã Đăk Rve	51
23485	Xã Đăk Kôi	51
23497	Xã Kon Braih	51
23500	Xã Đăk Hà	51
23504	Xã Đăk Pxi	51
23510	Xã Đăk Ui	51
23512	Xã Đăk Mar	51
23515	Xã Ngọk Réo	51
23527	Xã Sa Thầy	51
23530	Xã Rờ Kơi	51
23534	Xã Sa Bình	51
23535	Xã Ia Đal	51
23536	Xã Mô Rai	51
23538	Xã Ia Tơi	51
23548	Xã Ya Ly	51
21553	Phường Quy Nhơn Bắc	52
21583	Phường Quy Nhơn	52
21589	Phường Quy Nhơn Tây	52
21592	Phường Quy Nhơn Nam	52
21601	Phường Quy Nhơn Đông	52
21607	Xã Nhơn Châu	52
21609	Xã An Lão	52
21616	Xã An Vinh	52
21622	Xã An Toàn	52
21628	Xã An Hòa	52
21637	Phường Tam Quan	52
21640	Phường Bồng Sơn	52
21655	Phường Hoài Nhơn Bắc	52
21661	Phường Hoài Nhơn Tây	52
21664	Phường Hoài Nhơn	52
21670	Phường Hoài Nhơn Đông	52
21673	Phường Hoài Nhơn Nam	52
21688	Xã Hoài Ân	52
21697	Xã Ân Hảo	52
21703	Xã Vạn Đức	52
21715	Xã Ân Tường	52
21727	Xã Kim Sơn	52
21730	Xã Phù Mỹ	52
21733	Xã Bình Dương	52
21739	Xã Phù Mỹ Bắc	52
21751	Xã Phù Mỹ Đông	52
21757	Xã Phù Mỹ Tây	52
21769	Xã An Lương	52
21775	Xã Phù Mỹ Nam	52
21786	Xã Vĩnh Thạnh	52
21787	Xã Vĩnh Sơn	52
21796	Xã Vĩnh Thịnh	52
21805	Xã Vĩnh Quang	52
21808	Xã Tây Sơn	52
21817	Xã Bình Hiệp	52
21820	Xã Bình Khê	52
21829	Xã Bình An	52
21835	Xã Bình Phú	52
21853	Xã Phù Cát	52
21859	Xã Đề Gi	52
21868	Xã Hội Sơn	52
21871	Xã Hòa Hội	52
21880	Xã Cát Tiến	52
21892	Xã Xuân An	52
21901	Xã Ngô Mây	52
21907	Phường Bình Định	52
21910	Phường An Nhơn	52
21925	Phường An Nhơn Bắc	52
21934	Phường An Nhơn Đông	52
21940	Xã An Nhơn Tây	52
21943	Phường An Nhơn Nam	52
21952	Xã Tuy Phước	52
21964	Xã Tuy Phước Bắc	52
21970	Xã Tuy Phước Đông	52
21985	Xã Tuy Phước Tây	52
21994	Xã Vân Canh	52
21997	Xã Canh Liên	52
22006	Xã Canh Vinh	52
23563	Phường Diên Hồng	52
23575	Phường Pleiku	52
23584	Phường Thống Nhất	52
23586	Phường Hội Phú	52
23590	Xã Biển Hồ	52
23602	Phường An Phú	52
23611	Xã Gào	52
23614	Phường An Bình	52
23617	Phường An Khê	52
23629	Xã Cửu An	52
23638	Xã Kbang	52
23644	Xã Đak Rong	52
23647	Xã Sơn Lang	52
23650	Xã Krong	52
23668	Xã Tơ Tung	52
23674	Xã Kông Bơ La	52
23677	Xã Đak Đoa	52
23683	Xã Đak Sơmei	52
23701	Xã Kon Gang	52
23710	Xã Ia Băng	52
23714	Xã KDang	52
23722	Xã Chư Păh	52
23728	Xã Ia Khươl	52
23734	Xã Ia Ly	52
23737	Xã Ia Mơ	52
23749	Xã Ia Phí	52
23764	Xã Ia Grai	52
23767	Xã Ia Hrung	52
23776	Xã Ia Krái	52
23782	Xã Ia O	52
23788	Xã Ia Chia	52
23794	Xã Mang Yang	52
23798	Xã Ayun	52
23799	Xã Hra	52
23812	Xã Lơ Pang	52
23818	Xã Kon Chiêng	52
23824	Xã Kông Chro	52
23830	Xã Chư Krey	52
23833	Xã Ya Ma	52
23839	Xã SRó	52
23842	Xã Đăk Song	52
23851	Xã Chơ Long	52
23857	Xã Đức Cơ	52
23866	Xã Ia Krêl	52
23869	Xã Ia Dơk	52
23872	Xã Ia Dom	52
23881	Xã Ia Pnôn	52
23884	Xã Ia Nan	52
23887	Xã Chư Prông	52
23896	Xã Bàu Cạn	52
23908	Xã Ia Tôr	52
23911	Xã Ia Boòng	52
23917	Xã Ia Púch	52
23926	Xã Ia Pia	52
23935	Xã Ia Lâu	52
23941	Xã Chư Sê	52
23942	Xã Chư Pưh	52
23947	Xã Bờ Ngoong	52
23954	Xã Al Bá	52
23971	Xã Ia Hrú	52
23977	Xã Ia Ko	52
23986	Xã Ia Le	52
23995	Xã Đak Pơ	52
24007	Xã Ya Hội	52
24013	Xã Pờ Tó	52
24022	Xã Ia Pa	52
24028	Xã Ia Tul	52
24043	Xã Phú Thiện	52
24044	Phường Ayun Pa	52
24049	Xã Chư A Thai	52
24061	Xã Ia Hiao	52
24065	Xã Ia Rbol	52
24073	Xã Ia Sao	52
24076	Xã Phú Túc	52
24100	Xã Ia Dreh	52
24109	Xã Uar	52
24112	Xã Ia Rsai	52
22333	Phường Bắc Nha Trang	56
22366	Phường Nha Trang	56
22390	Phường Tây Nha Trang	56
22402	Phường Nam Nha Trang	56
22411	Phường Bắc Cam Ranh	56
22420	Phường Cam Ranh	56
22423	Phường Ba Ngòi	56
22432	Phường Cam Linh	56
22435	Xã Cam Hiệp	56
22453	Xã Cam Lâm	56
22465	Xã Cam An	56
22480	Xã Nam Cam Ranh	56
22489	Xã Vạn Ninh	56
22498	Xã Tu Bông	56
22504	Xã Đại Lãnh	56
22516	Xã Vạn Thắng	56
22525	Xã Vạn Hưng	56
22528	Phường Ninh Hòa	56
22546	Xã Bắc Ninh Hòa	56
22552	Xã Tây Ninh Hòa	56
22558	Xã Hòa Trí	56
22561	Phường Đông Ninh Hòa	56
22576	Xã Tân Định	56
22591	Phường Hòa Thắng	56
22597	Xã Nam Ninh Hòa	56
22609	Xã Khánh Vĩnh	56
22612	Xã Trung Khánh Vĩnh	56
22615	Xã Bắc Khánh Vĩnh	56
22624	Xã Tây Khánh Vĩnh	56
22648	Xã Nam Khánh Vĩnh	56
22651	Xã Diên Khánh	56
22657	Xã Diên Điền	56
22660	Xã Diên Lâm	56
22672	Xã Diên Thọ	56
22678	Xã Diên Lạc	56
22702	Xã Suối Hiệp	56
22708	Xã Suối Dầu	56
22714	Xã Khánh Sơn	56
22720	Xã Tây Khánh Sơn	56
22732	Xã Đông Khánh Sơn	56
22736	Đặc khu Trường Sa	56
22738	Phường Đô Vinh	56
22741	Phường Bảo An	56
22759	Phường Phan Rang	56
22780	Phường Đông Hải	56
22786	Xã Bác Ái Tây	56
22795	Xã Bác Ái	56
22801	Xã Bác Ái Đông	56
22810	Xã Ninh Sơn	56
22813	Xã Lâm Sơn	56
22822	Xã Mỹ Sơn	56
22828	Xã Anh Dũng	56
22834	Phường Ninh Chử	56
22840	Xã Công Hải	56
22846	Xã Vĩnh Hải	56
22849	Xã Thuận Bắc	56
22852	Xã Ninh Hải	56
22861	Xã Xuân Hải	56
22870	Xã Ninh Phước	56
22873	Xã Phước Hậu	56
22888	Xã Phước Dinh	56
22891	Xã Phước Hữu	56
22897	Xã Thuận Nam	56
22900	Xã Phước Hà	56
22909	Xã Cà Ná	56
22015	Phường Tuy Hòa	66
22045	Phường Bình Kiến	66
22051	Phường Sông Cầu	66
22057	Xã Xuân Lộc	66
22060	Xã Xuân Cảnh	66
22075	Xã Xuân Thọ	66
22076	Phường Xuân Đài	66
22081	Xã Đồng Xuân	66
22090	Xã Xuân Lãnh	66
22096	Xã Phú Mỡ	66
22111	Xã Xuân Phước	66
22114	Xã Tuy An Bắc	66
22120	Xã Tuy An Đông	66
22132	Xã Tuy An Tây	66
22147	Xã Ô Loan	66
22153	Xã Tuy An Nam	66
22165	Xã Sơn Hòa	66
22171	Xã Tây Sơn	66
22177	Xã Vân Hòa	66
22192	Xã Suối Trai	66
22207	Xã Sông Hinh	66
22222	Xã Đức Bình	66
22225	Xã Ea Bá	66
22237	Xã Ea Ly	66
22240	Phường Phú Yên	66
22250	Xã Sơn Thành	66
22255	Xã Tây Hòa	66
22258	Phường Đông Hòa	66
22261	Phường Hòa Hiệp	66
22276	Xã Hòa Thịnh	66
22285	Xã Hòa Mỹ	66
22291	Xã Hòa Xuân	66
22303	Xã Phú Hòa 2	66
22319	Xã Phú Hòa 1	66
24121	Phường Tân Lập	66
24133	Phường Buôn Ma Thuột	66
24154	Phường Thành Nhất	66
24163	Phường Tân An	66
24169	Phường Ea Kao	66
24175	Xã Hòa Phú	66
24181	Xã Ea Drăng	66
24184	Xã Ea H’Leo	66
24187	Xã Ea Hiao	66
24193	Xã Ea Wy	66
24208	Xã Ea Khăl	66
24211	Xã Ea Súp	66
24214	Xã Ia Lốp	66
24217	Xã Ea Rốk	66
24221	Xã Ia Rvê	66
24229	Xã Ea Bung	66
24235	Xã Buôn Đôn	66
24241	Xã Ea Wer	66
24250	Xã Ea Nuôl	66
24259	Xã Quảng Phú	66
24265	Xã Ea Kiết	66
24277	Xã Ea Tul	66
24280	Xã Cư M’gar	66
24286	Xã Ea M’Droh	66
24301	Xã Cuôr Đăng	66
24305	Phường Buôn Hồ	66
24310	Xã Krông Búk	66
24313	Xã Cư Pơng	66
24316	Xã Pơng Drang	66
24328	Xã Ea Drông	66
24340	Phường Cư Bao	66
24343	Xã Krông Năng	66
24346	Xã Dliê Ya	66
24352	Xã Tam Giang	66
24364	Xã Phú Xuân	66
24373	Xã Ea Kar	66
24376	Xã Ea Knốp	66
24400	Xã Ea Păl	66
24403	Xã Ea Ô	66
24406	Xã Cư Yang	66
24412	Xã M’Drắk	66
24415	Xã Cư Prao	66
24433	Xã Ea Riêng	66
24436	Xã Cư M’ta	66
24444	Xã Krông Á	66
24445	Xã Ea Trang	66
24448	Xã Krông Bông	66
24454	Xã Dang Kang	66
24472	Xã Hòa Sơn	66
24478	Xã Cư Pui	66
24484	Xã Yang Mao	66
24490	Xã Krông Pắc	66
24496	Xã Ea Kly	66
24502	Xã Ea Phê	66
24505	Xã Ea Knuếc	66
24526	Xã Tân Tiến	66
24529	Xã Vụ Bổn	66
24538	Xã Krông Ana	66
24540	Xã Ea Ning	66
24544	Xã Ea Ktur	66
24559	Xã Ea Na	66
24561	Xã Dray Bhăng	66
24568	Xã Dur Kmăl	66
24580	Xã Liên Sơn Lắk	66
24595	Xã Đắk Liêng	66
24598	Xã Đắk Phơi	66
24604	Xã Krông Nô	66
24607	Xã Nam Ka	66
22918	Phường Mũi Né	68
22924	Phường Phú Thủy	68
22933	Phường Hàm Thắng	68
22945	Phường Phan Thiết	68
22954	Phường Tiến Thành	68
22960	Phường Bình Thuận	68
22963	Xã Tuyên Quang	68
22969	Xã Liên Hương	68
22972	Xã Phan Rí Cửa	68
22978	Xã Tuy Phong	68
22981	Xã Vĩnh Hảo	68
23005	Xã Bắc Bình	68
23008	Xã Phan Sơn	68
23020	Xã Hải Ninh	68
23023	Xã Sông Lũy	68
23032	Xã Lương Sơn	68
23041	Xã Hồng Thái	68
23053	Xã Hòa Thắng	68
23059	Xã Hàm Thuận	68
23065	Xã La Dạ	68
23074	Xã Đông Giang	68
23086	Xã Hồng Sơn	68
23089	Xã Hàm Thuận Bắc	68
23095	Xã Hàm Liêm	68
23110	Xã Hàm Thuận Nam	68
23122	Xã Hàm Thạnh	68
23128	Xã Hàm Kiệm	68
23134	Xã Tân Lập	68
23143	Xã Tân Thành	68
23149	Xã Tánh Linh	68
23152	Xã Bắc Ruộng	68
23158	Xã Nghị Đức	68
23173	Xã Đồng Kho	68
23188	Xã Suối Kiết	68
23191	Xã Đức Linh	68
23194	Xã Hoài Đức	68
23200	Xã Nam Thành	68
23227	Xã Trà Tân	68
23230	Xã Tân Minh	68
23231	Phường Phước Hội	68
23235	Phường La Gi	68
23236	Xã Hàm Tân	68
23246	Xã Tân Hải	68
23266	Xã Sơn Mỹ	68
23272	Đặc khu Phú Quý	68
24611	Phường Bắc Gia Nghĩa	68
24615	Phường Nam Gia Nghĩa	68
24616	Xã Quảng Sơn	68
24617	Phường Đông Gia Nghĩa	68
24620	Xã Quảng Hòa	68
24631	Xã Quảng Khê	68
24637	Xã Tà Đùng	68
24640	Xã Cư Jút	68
24646	Xã Đắk Wil	68
24649	Xã Nam Dong	68
24664	Xã Đức Lập	68
24670	Xã Đắk Mil	68
24678	Xã Đắk Sắk	68
24682	Xã Thuận An	68
24688	Xã Krông Nô	68
24697	Xã Nam Đà	68
24703	Xã Nâm Nung	68
24712	Xã Quảng Phú	68
24717	Xã Đức An	68
24718	Xã Đắk Song	68
24722	Xã Thuận Hạnh	68
24730	Xã Trường Xuân	68
24733	Xã Kiến Đức	68
24736	Xã Quảng Trực	68
24739	Xã Tuy Đức	68
24748	Xã Quảng Tân	68
24751	Xã Nhân Cơ	68
24760	Xã Quảng Tín	68
24778	Phường Lâm Viên - Đà Lạt	68
24781	Phường Xuân Hương - Đà Lạt	68
24787	Phường Cam Ly - Đà Lạt	68
24805	Phường Xuân Trường - Đà Lạt	68
24820	Phường 2 Bảo Lộc	68
24823	Phường 1 Bảo Lộc	68
24829	Phường B'Lao	68
24841	Phường 3 Bảo Lộc	68
24846	Phường Lang Biang - Đà Lạt	68
24848	Xã Lạc Dương	68
24853	Xã Đam Rông 4	68
24868	Xã Nam Ban Lâm Hà	68
24871	Xã Đinh Văn Lâm Hà	68
24875	Xã Đam Rông 3	68
24877	Xã Đam Rông 2	68
24883	Xã Nam Hà Lâm Hà	68
24886	Xã Đam Rông 1	68
24895	Xã Phú Sơn Lâm Hà	68
24907	Xã Phúc Thọ Lâm Hà	68
24916	Xã Tân Hà Lâm Hà	68
24931	Xã Đơn Dương	68
24934	Xã D'Ran	68
24943	Xã Ka Đô	68
24955	Xã Quảng Lập	68
24958	Xã Đức Trọng	68
24967	Xã Hiệp Thạnh	68
24976	Xã Tân Hội	68
24985	Xã Ninh Gia	68
24988	Xã Tà Năng	68
24991	Xã Tà Hine	68
25000	Xã Di Linh	68
25007	Xã Đinh Trang Thượng	68
25015	Xã Gia Hiệp	68
25018	Xã Bảo Thuận	68
25036	Xã Hòa Ninh	68
25042	Xã Hòa Bắc	68
25051	Xã Sơn Điền	68
25054	Xã Bảo Lâm 1	68
25057	Xã Bảo Lâm 5	68
25063	Xã Bảo Lâm 4	68
25084	Xã Bảo Lâm 2	68
25093	Xã Bảo Lâm 3	68
25099	Xã Đạ Huoai	68
25105	Xã Đạ Huoai 2	68
25114	Xã Đạ Huoai 3	68
25126	Xã Đạ Tẻh	68
25135	Xã Đạ Tẻh 3	68
25138	Xã Đạ Tẻh 2	68
25159	Xã Cát Tiên	68
25162	Xã Cát Tiên 3	68
25180	Xã Cát Tiên 2	68
25195	Phường Bình Phước	75
25210	Phường Đồng Xoài	75
25217	Phường Phước Long	75
25220	Phường Phước Bình	75
25222	Xã Bù Gia Mập	75
25225	Xã Đăk Ơ	75
25231	Xã Đa Kia	75
25246	Xã Bình Tân	75
25252	Xã Phú Riềng	75
25255	Xã Long Hà	75
25261	Xã Phú Trung	75
25267	Xã Phú Nghĩa	75
25270	Xã Lộc Ninh	75
25279	Xã Lộc Tấn	75
25280	Xã Lộc Thạnh	75
25292	Xã Lộc Quang	75
25294	Xã Lộc Thành	75
25303	Xã Lộc Hưng	75
25308	Xã Thiện Hưng	75
25309	Xã Hưng Phước	75
25318	Xã Tân Tiến	75
25326	Phường Bình Long	75
25333	Phường An Lộc	75
25345	Xã Tân Hưng	75
25349	Xã Minh Đức	75
25351	Xã Tân Quan	75
25357	Xã Tân Khai	75
25363	Xã Đồng Phú	75
25378	Xã Tân Lợi	75
25387	Xã Thuận Lợi	75
25390	Xã Đồng Tâm	75
25396	Xã Bù Đăng	75
25399	Xã Đak Nhau	75
25402	Xã Thọ Sơn	75
25405	Xã Bom Bo	75
25417	Xã Nghĩa Trung	75
25420	Xã Phước Sơn	75
25432	Phường Chơn Thành	75
25441	Phường Minh Hưng	75
25450	Xã Nha Bích	75
25993	Phường Trảng Dài	75
26005	Phường Hố Nai	75
26017	Phường Tam Hiệp	75
26020	Phường Long Bình	75
26041	Phường Trấn Biên	75
26068	Phường Biên Hòa	75
26080	Phường Long Khánh	75
26089	Phường Bình Lộc	75
26098	Phường Bảo Vinh	75
26104	Phường Xuân Lập	75
26113	Phường Hàng Gòn	75
26116	Xã Tân Phú	75
26119	Xã Đak Lua	75
26122	Xã Nam Cát Tiên	75
26134	Xã Tà Lài	75
26158	Xã Phú Lâm	75
26170	Xã Trị An	75
26173	Xã Phú Lý	75
26179	Xã Tân An	75
26188	Phường Tân Triều	75
26206	Xã Định Quán	75
26209	Xã Thanh Sơn	75
26215	Xã Phú Vinh	75
26221	Xã Phú Hòa	75
26227	Xã La Ngà	75
26248	Xã Trảng Bom	75
26254	Xã Bàu Hàm	75
26278	Xã Bình Minh	75
26281	Xã Hưng Thịnh	75
26296	Xã An Viễn	75
26299	Xã Thống Nhất	75
26311	Xã Gia Kiệm	75
26326	Xã Dầu Giây	75
26332	Xã Xuân Quế	75
26341	Xã Cẩm Mỹ	75
26347	Xã Xuân Đường	75
26359	Xã Xuân Đông	75
26362	Xã Sông Ray	75
26368	Xã Long Thành	75
26374	Phường Tam Phước	75
26377	Phường Phước Tân	75
26380	Phường Long Hưng	75
26383	Xã An Phước	75
26389	Xã Bình An	75
26413	Xã Long Phước	75
26422	Xã Phước Thái	75
26425	Xã Xuân Lộc	75
26428	Xã Xuân Bắc	75
26434	Xã Xuân Thành	75
26446	Xã Xuân Hòa	75
26458	Xã Xuân Phú	75
26461	Xã Xuân Định	75
26485	Xã Nhơn Trạch	75
26491	Xã Đại Phước	75
26503	Xã Phước An	75
25747	Phường Thủ Dầu Một	79
25750	Phường Phú Lợi	79
25760	Phường Bình Dương	79
25768	Phường Phú An	79
25771	Phường Chánh Hiệp	79
25777	Xã Dầu Tiếng	79
25780	Xã Minh Thạnh	79
25792	Xã Long Hòa	79
25807	Xã Thanh An	79
25813	Phường Bến Cát	79
25819	Xã Trừ Văn Thố	79
25822	Xã Bàu Bàng	79
25837	Phường Chánh Phú Hòa	79
25840	Phường Long Nguyên	79
25843	Phường Tây Nam	79
25846	Phường Thới Hòa	79
25849	Phường Hòa Lợi	79
25858	Xã Phú Giáo	79
25864	Xã Phước Thành	79
25867	Xã An Long	79
25882	Xã Phước Hòa	79
25888	Phường Tân Uyên	79
25891	Phường Tân Khánh	79
25906	Xã Bắc Tân Uyên	79
25909	Xã Thường Tân	79
25912	Phường Vĩnh Tân	79
25915	Phường Bình Cơ	79
25920	Phường Tân Hiệp	79
25942	Phường Dĩ An	79
25945	Phường Tân Đông Hiệp	79
25951	Phường Đông Hòa	79
25966	Phường Lái Thiêu	79
25969	Phường Thuận Giao	79
25975	Phường An Phú	79
25978	Phường Thuận An	79
25987	Phường Bình Hòa	79
26506	Phường Vũng Tàu	79
26526	Phường Tam Thắng	79
26536	Phường Rạch Dừa	79
26542	Phường Phước Thắng	79
26545	Xã Long Sơn	79
26560	Phường Bà Rịa	79
26566	Phường Long Hương	79
26572	Phường Tam Long	79
26575	Xã Ngãi Giao	79
26584	Xã Xuân Sơn	79
26590	Xã Bình Giã	79
26596	Xã Châu Đức	79
26608	Xã Kim Long	79
26617	Xã Nghĩa Thành	79
26620	Xã Hồ Tràm	79
26632	Xã Xuyên Mộc	79
26638	Xã Bàu Lâm	79
26641	Xã Hòa Hội	79
26647	Xã Hòa Hiệp	79
26656	Xã Bình Châu	79
26659	Xã Long Điền	79
26662	Xã Long Hải	79
26680	Xã Đất Đỏ	79
26686	Xã Phước Hải	79
26704	Phường Phú Mỹ	79
26710	Phường Tân Hải	79
26713	Phường Tân Phước	79
26725	Phường Tân Thành	79
26728	Xã Châu Pha	79
26732	Đặc khu Côn Đảo	79
26737	Phường Tân Định	79
26740	Phường Sài Gòn	79
26743	Phường Bến Thành	79
26758	Phường Cầu Ông Lãnh	79
26767	Phường An Phú Đông	79
26773	Phường Thới An	79
26782	Phường Tân Thới Hiệp	79
26785	Phường Trung Mỹ Tây	79
26791	Phường Đông Hưng Thuận	79
26800	Phường Linh Xuân	79
26803	Phường Tam Bình	79
26809	Phường Hiệp Bình	79
26824	Phường Thủ Đức	79
26833	Phường Long Bình	79
26842	Phường Tăng Nhơn Phú	79
26848	Phường Phước Long	79
26857	Phường Long Phước	79
26860	Phường Long Trường	79
26876	Phường An Nhơn	79
26878	Phường An Hội Đông	79
26882	Phường An Hội Tây	79
26884	Phường Gò Vấp	79
26890	Phường Hạnh Thông	79
26898	Phường Thông Tây Hội	79
26905	Phường Bình Lợi Trung	79
26911	Phường Bình Quới	79
26929	Phường Bình Thạnh	79
26944	Phường Gia Định	79
26956	Phường Thạnh Mỹ Tây	79
26968	Phường Tân Sơn Nhất	79
26977	Phường Tân Sơn Hòa	79
26983	Phường Bảy Hiền	79
26995	Phường Tân Hòa	79
27004	Phường Tân Bình	79
27007	Phường Tân Sơn	79
27013	Phường Tây Thạnh	79
27019	Phường Tân Sơn Nhì	79
27022	Phường Phú Thọ Hòa	79
27028	Phường Phú Thạnh	79
27031	Phường Tân Phú	79
27043	Phường Đức Nhuận	79
27058	Phường Cầu Kiệu	79
27073	Phường Phú Nhuận	79
27094	Phường An Khánh	79
27097	Phường Bình Trưng	79
27112	Phường Cát Lái	79
27139	Phường Xuân Hòa	79
27142	Phường Nhiêu Lộc	79
27154	Phường Bàn Cờ	79
27163	Phường Hòa Hưng	79
27169	Phường Diên Hồng	79
27190	Phường Vườn Lài	79
27211	Phường Hòa Bình	79
27226	Phường Phú Thọ	79
27232	Phường Bình Thới	79
27238	Phường Minh Phụng	79
27259	Phường Xóm Chiếu	79
27265	Phường Khánh Hội	79
27286	Phường Vĩnh Hội	79
27301	Phường Chợ Quán	79
27316	Phường An Đông	79
27343	Phường Chợ Lớn	79
27349	Phường Phú Lâm	79
27364	Phường Bình Phú	79
27367	Phường Bình Tây	79
27373	Phường Bình Tiên	79
27418	Phường Chánh Hưng	79
27424	Phường Bình Đông	79
27427	Phường Phú Định	79
27439	Phường Bình Hưng Hòa	79
27442	Phường Bình Tân	79
27448	Phường Bình Trị Đông	79
27457	Phường Tân Tạo	79
27460	Phường An Lạc	79
27475	Phường Tân Hưng	79
27478	Phường Tân Thuận	79
27484	Phường Phú Thuận	79
27487	Phường Tân Mỹ	79
27496	Xã Tân An Hội	79
27508	Xã An Nhơn Tây	79
27511	Xã Nhuận Đức	79
27526	Xã Thái Mỹ	79
27541	Xã Phú Hòa Đông	79
27544	Xã Bình Mỹ	79
27553	Xã Củ Chi	79
27559	Xã Hóc Môn	79
27568	Xã Đông Thạnh	79
27577	Xã Xuân Thới Sơn	79
27592	Xã Bà Điểm	79
27595	Xã Tân Nhựt	79
27601	Xã Vĩnh Lộc	79
27604	Xã Tân Vĩnh Lộc	79
27610	Xã Bình Lợi	79
27619	Xã Bình Hưng	79
27628	Xã Hưng Long	79
27637	Xã Bình Chánh	79
27655	Xã Nhà Bè	79
27658	Xã Hiệp Phước	79
27664	Xã Cần Giờ	79
27667	Xã Bình Khánh	79
27673	Xã An Thới Đông	79
27676	Xã Thạnh An	79
25459	Phường Tân Ninh	80
25480	Phường Bình Minh	80
25486	Xã Tân Biên	80
25489	Xã Tân Lập	80
25498	Xã Thạnh Bình	80
25510	Xã Trà Vong	80
25516	Xã Tân Châu	80
25522	Xã Tân Đông	80
25525	Xã Tân Hội	80
25531	Xã Tân Hòa	80
25534	Xã Tân Thành	80
25549	Xã Tân Phú	80
25552	Xã Dương Minh Châu	80
25567	Phường Ninh Thạnh	80
25573	Xã Cầu Khởi	80
25579	Xã Lộc Ninh	80
25585	Xã Châu Thành	80
25588	Xã Hảo Đước	80
25591	Xã Phước Vinh	80
25606	Xã Hòa Hội	80
25621	Xã Ninh Điền	80
25630	Phường Long Hoa	80
25633	Phường Thanh Điền	80
25645	Phường Hòa Thành	80
25654	Phường Gò Dầu	80
25657	Xã Thạnh Đức	80
25663	Xã Phước Thạnh	80
25666	Xã Truông Mít	80
25672	Phường Gia Lộc	80
25681	Xã Bến Cầu	80
25684	Xã Long Chữ	80
25702	Xã Long Thuận	80
25708	Phường Trảng Bàng	80
25711	Xã Hưng Thuận	80
25729	Xã Phước Chỉ	80
25732	Phường An Tịnh	80
27694	Phường Long An	80
27712	Phường Tân An	80
27715	Phường Khánh Hậu	80
27721	Xã Tân Hưng	80
27727	Xã Hưng Điền	80
27736	Xã Vĩnh Thạnh	80
27748	Xã Vĩnh Châu	80
27757	Xã Vĩnh Hưng	80
27763	Xã Khánh Hưng	80
27775	Xã Tuyên Bình	80
27787	Phường Kiến Tường	80
27793	Xã Bình Hiệp	80
27811	Xã Bình Hòa	80
27817	Xã Tuyên Thạnh	80
27823	Xã Mộc Hóa	80
27826	Xã Tân Thạnh	80
27838	Xã Nhơn Hòa Lập	80
27841	Xã Hậu Thạnh	80
27856	Xã Nhơn Ninh	80
27865	Xã Thạnh Hóa	80
27868	Xã Bình Thành	80
27877	Xã Thạnh Phước	80
27889	Xã Tân Tây	80
27898	Xã Đông Thành	80
27907	Xã Mỹ Quý	80
27925	Xã Đức Huệ	80
27931	Xã Hậu Nghĩa	80
27937	Xã Đức Hòa	80
27943	Xã An Ninh	80
27952	Xã Hiệp Hòa	80
27964	Xã Đức Lập	80
27976	Xã Mỹ Hạnh	80
27979	Xã Hòa Khánh	80
27991	Xã Bến Lức	80
27994	Xã Thạnh Lợi	80
28003	Xã Lương Hòa	80
28015	Xã Bình Đức	80
28018	Xã Mỹ Yên	80
28036	Xã Thủ Thừa	80
28051	Xã Mỹ Thạnh	80
28066	Xã Mỹ An	80
28072	Xã Tân Long	80
28075	Xã Tân Trụ	80
28087	Xã Nhựt Tảo	80
28093	Xã Vàm Cỏ	80
28108	Xã Cần Đước	80
28114	Xã Rạch Kiến	80
28126	Xã Long Cang	80
28132	Xã Mỹ Lệ	80
28138	Xã Tân Lân	80
28144	Xã Long Hựu	80
28159	Xã Cần Giuộc	80
28165	Xã Phước Lý	80
28177	Xã Mỹ Lộc	80
28201	Xã Phước Vĩnh Tây	80
28207	Xã Tân Tập	80
28210	Xã Tầm Vu	80
28222	Xã Vĩnh Công	80
28225	Xã Thuận Mỹ	80
28243	Xã An Lục Long	80
28249	Phường Đạo Thạnh	82
28261	Phường Mỹ Tho	82
28270	Phường Thới Sơn	82
28273	Phường Mỹ Phong	82
28285	Phường Trung An	82
28297	Phường Long Thuận	82
28306	Phường Gò Công	82
28315	Phường Bình Xuân	82
28321	Xã Tân Phước 1	82
28327	Xã Tân Phước 2	82
28336	Xã Hưng Thạnh	82
28345	Xã Tân Phước 3	82
28360	Xã Cái Bè	82
28366	Xã Hậu Mỹ	82
28378	Xã Mỹ Thiện	82
28393	Xã Hội Cư	82
28405	Xã Mỹ Đức Tây	82
28414	Xã Mỹ Lợi	82
28426	Xã Thanh Hưng	82
28429	Xã An Hữu	82
28435	Phường Mỹ Phước Tây	82
28436	Phường Thanh Hòa	82
28439	Phường Cai Lậy	82
28444	Xã Thạnh Phú	82
28456	Xã Mỹ Thành	82
28468	Xã Tân Phú	82
28471	Xã Bình Phú	82
28477	Phường Nhị Quý	82
28501	Xã Hiệp Đức	82
28504	Xã Long Tiên	82
28516	Xã Ngũ Hiệp	82
28519	Xã Châu Thành	82
28525	Xã Tân Hương	82
28537	Xã Long Hưng	82
28543	Xã Long Định	82
28564	Xã Bình Trưng	82
28576	Xã Vĩnh Kim	82
28582	Xã Kim Sơn	82
28594	Xã Chợ Gạo	82
28603	Xã Mỹ Tịnh An	82
28615	Xã Lương Hòa Lạc	82
28627	Xã Tân Thuận Bình	82
28633	Xã An Thạnh Thủy	82
28648	Xã Bình Ninh	82
28651	Xã Vĩnh Bình	82
28660	Xã Đồng Sơn	82
28663	Xã Phú Thành	82
28678	Xã Vĩnh Hựu	82
28687	Xã Long Bình	82
28693	Xã Tân Thới	82
28696	Xã Tân Phú Đông	82
28702	Xã Tân Hòa	82
28720	Xã Gia Thuận	82
28723	Xã Tân Đông	82
28729	Phường Sơn Qui	82
28738	Xã Tân Điền	82
28747	Xã Gò Công Đông	82
29869	Phường Cao Lãnh	82
29884	Phường Mỹ Ngãi	82
29888	Phường Mỹ Trà	82
29905	Phường Sa Đéc	82
29926	Xã Tân Hồng	82
29929	Xã Tân Hộ Cơ	82
29938	Xã Tân Thành	82
29944	Xã An Phước	82
29954	Phường An Bình	82
29955	Phường Hồng Ngự	82
29971	Xã Thường Phước	82
29978	Phường Thường Lạc	82
29983	Xã Long Khánh	82
29992	Xã Long Phú Thuận	82
30001	Xã Tràm Chim	82
30010	Xã Tam Nông	82
30019	Xã An Hòa	82
30025	Xã Phú Cường	82
30028	Xã An Long	82
30034	Xã Phú Thọ	82
30037	Xã Tháp Mười	82
30043	Xã Phương Thịnh	82
30046	Xã Trường Xuân	82
30055	Xã Mỹ Quí	82
30061	Xã Đốc Binh Kiều	82
30073	Xã Thanh Mỹ	82
30076	Xã Mỹ Thọ	82
30085	Xã Ba Sao	82
30088	Xã Phong Mỹ	82
30112	Xã Mỹ Hiệp	82
30118	Xã Bình Hàng Trung	82
30130	Xã Thanh Bình	82
30154	Xã Tân Long	82
30157	Xã Tân Thạnh	82
30163	Xã Bình Thành	82
30169	Xã Lấp Vò	82
30178	Xã Mỹ An Hưng	82
30184	Xã Tân Khánh Trung	82
30208	Xã Hòa Long	82
30214	Xã Tân Dương	82
30226	Xã Lai Vung	82
30235	Xã Phong Hòa	82
30244	Xã Phú Hựu	82
30253	Xã Tân Nhuận Đông	82
30259	Xã Tân Phú Trung	82
28756	Phường Phú Khương	86
28777	Phường An Hội	86
28783	Phường Sơn Đông	86
28789	Phường Bến Tre	86
28807	Xã Giao Long	86
28810	Xã Phú Túc	86
28840	Xã Tân Phú	86
28858	Phường Phú Tân	86
28861	Xã Tiên Thủy	86
28870	Xã Chợ Lách	86
28879	Xã Phú Phụng	86
28894	Xã Vĩnh Thành	86
28901	Xã Hưng Khánh Trung	86
28903	Xã Mỏ Cày	86
28915	Xã Phước Mỹ Trung	86
28921	Xã Tân Thành Bình	86
28945	Xã Đồng Khởi	86
28948	Xã Nhuận Phú Tân	86
28957	Xã An Định	86
28969	Xã Thành Thới	86
28981	Xã Hương Mỹ	86
28984	Xã Giồng Trôm	86
28987	Xã Lương Hòa	86
28993	Xã Lương Phú	86
28996	Xã Châu Hòa	86
29020	Xã Phước Long	86
29029	Xã Tân Hào	86
29044	Xã Hưng Nhượng	86
29050	Xã Bình Đại	86
29062	Xã Phú Thuận	86
29077	Xã Lộc Thuận	86
29083	Xã Châu Hưng	86
29089	Xã Thạnh Trị	86
29104	Xã Thạnh Phước	86
29107	Xã Thới Thuận	86
29110	Xã Ba Tri	86
29122	Xã Mỹ Chánh Hòa	86
29125	Xã Bảo Thạnh	86
29137	Xã Tân Xuân	86
29143	Xã An Ngãi Trung	86
29158	Xã An Hiệp	86
29167	Xã Tân Thủy	86
29182	Xã Thạnh Phú	86
29191	Xã Quới Điền	86
29194	Xã Đại Điền	86
29221	Xã Thạnh Hải	86
29224	Xã An Qui	86
29227	Xã Thạnh Phong	86
29242	Phường Trà Vinh	86
29254	Phường Nguyệt Hóa	86
29263	Phường Long Đức	86
29266	Xã Càng Long	86
29275	Xã An Trường	86
29278	Xã Tân An	86
29287	Xã Bình Phú	86
29302	Xã Nhị Long	86
29308	Xã Cầu Kè	86
29317	Xã An Phú Tân	86
29329	Xã Phong Thạnh	86
29335	Xã Tam Ngãi	86
29341	Xã Tiểu Cần	86
29362	Xã Hùng Hòa	86
29365	Xã Tập Ngãi	86
29371	Xã Tân Hòa	86
29374	Xã Châu Thành	86
29386	Xã Song Lộc	86
29398	Phường Hòa Thuận	86
29407	Xã Hưng Mỹ	86
29410	Xã Hòa Minh	86
29413	Xã Long Hòa	86
29416	Xã Cầu Ngang	86
29419	Xã Mỹ Long	86
29431	Xã Vinh Kim	86
29446	Xã Nhị Trường	86
29455	Xã Hiệp Mỹ	86
29461	Xã Trà Cú	86
29467	Xã Tập Sơn	86
29476	Xã Lưu Nghiệp Anh	86
29489	Xã Hàm Giang	86
29491	Xã Đại An	86
29497	Xã Đôn Châu	86
29506	Xã Long Hiệp	86
29512	Phường Duyên Hải	86
29513	Xã Long Thành	86
29516	Phường Trường Long Hòa	86
29518	Xã Long Hữu	86
29530	Xã Ngũ Lạc	86
29533	Xã Long Vĩnh	86
29536	Xã Đông Hải	86
29551	Phường Long Châu	86
29557	Phường Phước Hậu	86
29566	Phường Tân Ngãi	86
29584	Xã An Bình	86
29590	Phường Thanh Đức	86
29593	Phường Tân Hạnh	86
29602	Xã Long Hồ	86
29611	Xã Phú Quới	86
29623	Xã Nhơn Phú	86
29638	Xã Bình Phước	86
29641	Xã Cái Nhum	86
29653	Xã Tân Long Hội	86
29659	Xã Trung Thành	86
29668	Xã Quới An	86
29677	Xã Quới Thiện	86
29683	Xã Trung Hiệp	86
29698	Xã Trung Ngãi	86
29701	Xã Hiếu Phụng	86
29713	Xã Hiếu Thành	86
29719	Xã Tam Bình	86
29728	Xã Cái Ngang	86
29734	Xã Hòa Hiệp	86
29740	Xã Song Phú	86
29767	Xã Ngãi Tứ	86
29770	Phường Cái Vồn	86
29771	Phường Bình Minh	86
29785	Xã Tân Lược	86
29788	Xã Mỹ Thuận	86
29800	Xã Tân Quới	86
29812	Phường Đông Thành	86
29821	Xã Trà Ôn	86
29830	Xã Hòa Bình	86
29836	Xã Trà Côn	86
29845	Xã Vĩnh Xuân	86
29857	Xã Lục Sĩ Thành	86
30292	Phường Bình Đức	91
30301	Phường Mỹ Thới	91
30307	Phường Long Xuyên	91
30313	Xã Mỹ Hòa Hưng	91
30316	Phường Châu Đốc	91
30325	Phường Vĩnh Tế	91
30337	Xã An Phú	91
30341	Xã Khánh Bình	91
30346	Xã Nhơn Hội	91
30352	Xã Phú Hữu	91
30367	Xã Vĩnh Hậu	91
30376	Phường Tân Châu	91
30377	Phường Long Phú	91
30385	Xã Vĩnh Xương	91
30388	Xã Tân An	91
30403	Xã Châu Phong	91
30406	Xã Phú Tân	91
30409	Xã Chợ Vàm	91
30421	Xã Phú Lâm	91
30430	Xã Hòa Lạc	91
30436	Xã Phú An	91
30445	Xã Bình Thạnh Đông	91
30463	Xã Châu Phú	91
30469	Xã Mỹ Đức	91
30478	Xã Vĩnh Thạnh Trung	91
30481	Xã Thạnh Mỹ Tây	91
30487	Xã Bình Mỹ	91
30502	Phường Thới Sơn	91
30505	Phường Chi Lăng	91
30520	Phường Tịnh Biên	91
30526	Xã An Cư	91
30538	Xã Núi Cấm	91
30544	Xã Tri Tôn	91
30547	Xã Ba Chúc	91
30568	Xã Vĩnh Gia	91
30577	Xã Ô Lâm	91
30580	Xã Cô Tô	91
30589	Xã An Châu	91
30595	Xã Cần Đăng	91
30604	Xã Vĩnh An	91
30607	Xã Bình Hòa	91
30619	Xã Vĩnh Hanh	91
30628	Xã Chợ Mới	91
30631	Xã Long Điền	91
30643	Xã Cù Lao Giêng	91
30658	Xã Nhơn Mỹ	91
30664	Xã Long Kiến	91
30673	Xã Hội An	91
30682	Xã Thoại Sơn	91
30685	Xã Phú Hòa	91
30688	Xã Óc Eo	91
30691	Xã Tây Phú	91
30697	Xã Vĩnh Trạch	91
30709	Xã Định Mỹ	91
30742	Phường Rạch Giá	91
30760	Phường Vĩnh Thông	91
30766	Phường Tô Châu	91
30769	Phường Hà Tiên	91
30781	Xã Tiên Hải	91
30787	Xã Kiên Lương	91
30790	Xã Hòa Điền	91
30793	Xã Vĩnh Điều	91
30796	Xã Giang Thành	91
30811	Xã Sơn Hải	91
30814	Xã Hòn Nghệ	91
30817	Xã Hòn Đất	91
30823	Xã Bình Sơn	91
30826	Xã Bình Giang	91
30835	Xã Sơn Kiên	91
30838	Xã Mỹ Thuận	91
30850	Xã Tân Hiệp	91
30856	Xã Tân Hội	91
30874	Xã Thạnh Đông	91
30880	Xã Châu Thành	91
30886	Xã Thạnh Lộc	91
30898	Xã Bình An	91
30904	Xã Giồng Riềng	91
30910	Xã Thạnh Hưng	91
30928	Xã Ngọc Chúc	91
30934	Xã Hòa Hưng	91
30943	Xã Long Thạnh	91
30949	Xã Hòa Thuận	91
30952	Xã Gò Quao	91
30958	Xã Định Hòa	91
30970	Xã Vĩnh Hòa Hưng	91
30982	Xã Vĩnh Tuy	91
30985	Xã An Biên	91
30988	Xã Tây Yên	91
31006	Xã Đông Thái	91
31012	Xã Vĩnh Hòa	91
31018	Xã An Minh	91
31024	Xã Đông Hòa	91
31027	Xã U Minh Thượng	91
31031	Xã Tân Thạnh	91
31036	Xã Đông Hưng	91
31042	Xã Vân Khánh	91
31051	Xã Vĩnh Phong	91
31064	Xã Vĩnh Bình	91
31069	Xã Vĩnh Thuận	91
31078	Đặc khu Phú Quốc	91
31105	Đặc khu Thổ Châu	91
31108	Đặc khu Kiên Hải	91
31120	Phường Cái Khế	92
31135	Phường Ninh Kiều	92
31147	Phường Tân An	92
31150	Phường An Bình	92
31153	Phường Ô Môn	92
31157	Phường Thới Long	92
31162	Phường Phước Thới	92
31168	Phường Bình Thủy	92
31174	Phường Thới An Đông	92
31183	Phường Long Tuyền	92
31186	Phường Cái Răng	92
31201	Phường Hưng Phú	92
31207	Phường Thốt Nốt	92
31213	Phường Tân Lộc	92
31217	Phường Trung Nhứt	92
31228	Phường Thuận Hưng	92
31231	Xã Thạnh An	92
31232	Xã Vĩnh Thạnh	92
31237	Xã Vĩnh Trinh	92
31246	Xã Thạnh Quới	92
31249	Xã Thạnh Phú	92
31255	Xã Trung Hưng	92
31258	Xã Thới Lai	92
31261	Xã Cờ Đỏ	92
31264	Xã Thới Hưng	92
31273	Xã Đông Hiệp	92
31282	Xã Đông Thuận	92
31288	Xã Trường Thành	92
31294	Xã Trường Xuân	92
31299	Xã Phong Điền	92
31309	Xã Trường Long	92
31315	Xã Nhơn Ái	92
31321	Phường Vị Thanh	92
31333	Phường Vị Tân	92
31338	Xã Hỏa Lựu	92
31340	Phường Ngã Bảy	92
31342	Xã Tân Hòa	92
31348	Xã Trường Long Tây	92
31360	Xã Thạnh Xuân	92
31366	Xã Châu Thành	92
31369	Xã Đông Phước	92
31378	Xã Phú Hữu	92
31393	Xã Hòa An	92
31396	Xã Hiệp Hưng	92
31399	Xã Tân Bình	92
31408	Xã Thạnh Hòa	92
31411	Phường Đại Thành	92
31420	Xã Phụng Hiệp	92
31426	Xã Phương Bình	92
31432	Xã Tân Phước Hưng	92
31441	Xã Vị Thủy	92
31453	Xã Vĩnh Thuận Đông	92
31459	Xã Vĩnh Tường	92
31465	Xã Vị Thanh 1	92
31471	Phường Long Mỹ	92
31473	Phường Long Bình	92
31480	Phường Long Phú 1	92
31489	Xã Vĩnh Viễn	92
31492	Xã Lương Tâm	92
31495	Xã Xà Phiên	92
31507	Phường Sóc Trăng	92
31510	Phường Phú Lợi	92
31528	Xã Kế Sách	92
31531	Xã An Lạc Thôn	92
31537	Xã Phong Nẫm	92
31540	Xã Thới An Hội	92
31552	Xã Nhơn Mỹ	92
31561	Xã Đại Hải	92
31567	Xã Mỹ Tú	92
31569	Xã Phú Tâm	92
31570	Xã Hồ Đắc Kiện	92
31579	Xã Long Hưng	92
31582	Xã Thuận Hòa	92
31591	Xã Mỹ Hương	92
31594	Xã An Ninh	92
31603	Xã Mỹ Phước	92
31615	Xã An Thạnh	92
31633	Xã Cù Lao Dung	92
31639	Xã Long Phú	92
31645	Xã Đại Ngãi	92
31654	Xã Trường Khánh	92
31666	Xã Tân Thạnh	92
31673	Xã Trần Đề	92
31675	Xã Liêu Tú	92
31679	Xã Lịch Hội Thượng	92
31684	Phường Mỹ Xuyên	92
31687	Xã Tài Văn	92
31699	Xã Thạnh Thới An	92
31708	Xã Nhu Gia	92
31717	Xã Hòa Tú	92
31723	Xã Ngọc Tố	92
31726	Xã Gia Hòa	92
31732	Phường Ngã Năm	92
31741	Xã Tân Long	92
31753	Phường Mỹ Quới	92
31756	Xã Phú Lộc	92
31759	Xã Lâm Tân	92
31777	Xã Vĩnh Lợi	92
31783	Phường Vĩnh Châu	92
31789	Phường Khánh Hòa	92
31795	Xã Vĩnh Hải	92
31804	Phường Vĩnh Phước	92
31810	Xã Lai Hòa	92
31825	Phường Bạc Liêu	96
31834	Phường Vĩnh Trạch	96
31840	Phường Hiệp Thành	96
31843	Xã Hồng Dân	96
31849	Xã Ninh Quới	96
31858	Xã Vĩnh Lộc	96
31864	Xã Ninh Thạnh Lợi	96
31867	Xã Phước Long	96
31876	Xã Vĩnh Phước	96
31882	Xã Vĩnh Thanh	96
31885	Xã Phong Hiệp	96
31891	Xã Hòa Bình	96
31894	Xã Châu Thới	96
31900	Xã Vĩnh Lợi	96
31906	Xã Hưng Hội	96
31918	Xã Vĩnh Mỹ	96
31927	Xã Vĩnh Hậu	96
31942	Phường Giá Rai	96
31951	Phường Láng Tròn	96
31957	Xã Phong Thạnh	96
31972	Xã Gành Hào	96
31975	Xã Đông Hải	96
31985	Xã Long Điền	96
31988	Xã An Trạch	96
31993	Xã Định Thành	96
32002	Phường An Xuyên	96
32014	Phường Lý Văn Lâm	96
32025	Phường Tân Thành	96
32041	Phường Hòa Thành	96
32044	Xã Nguyễn Phích	96
32047	Xã U Minh	96
32059	Xã Khánh An	96
32062	Xã Khánh Lâm	96
32065	Xã Thới Bình	96
32069	Xã Biển Bạch	96
32071	Xã Trí Phải	96
32083	Xã Tân Lộc	96
32092	Xã Hồ Thị Kỷ	96
32095	Xã Trần Văn Thời	96
32098	Xã Sông Đốc	96
32104	Xã Đá Bạc	96
32110	Xã Khánh Bình	96
32119	Xã Khánh Hưng	96
32128	Xã Cái Nước	96
32134	Xã Lương Thế Trân	96
32137	Xã Tân Hưng	96
32140	Xã Hưng Mỹ	96
32152	Xã Đầm Dơi	96
32155	Xã Tạ An Khương	96
32161	Xã Trần Phán	96
32167	Xã Tân Thuận	96
32182	Xã Quách Phẩm	96
32185	Xã Thanh Tùng	96
32188	Xã Tân Tiến	96
32191	Xã Năm Căn	96
32201	Xã Đất Mới	96
32206	Xã Tam Giang	96
32212	Xã Cái Đôi Vàm	96
32214	Xã Phú Mỹ	96
32218	Xã Phú Tân	96
32227	Xã Nguyễn Việt Khái	96
32236	Xã Tân Ân	96
32244	Xã Phan Ngọc Hiển	96
32248	Xã Đất Mũi	96
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist (id, "userId") FROM stdin;
\.


--
-- Data for Name: wishlist_products_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_products_product ("wishlistId", "productId") FROM stdin;
\.


--
-- Name: genre PK_0285d4f1655d080cfcf7d1ab141; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY (id);


--
-- Name: order PK_1031171c13130102495201e3e20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id);


--
-- Name: contact_message PK_1476ca9a6265a586f618ea918fd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_message
    ADD CONSTRAINT "PK_1476ca9a6265a586f618ea918fd" PRIMARY KEY (id);


--
-- Name: wards PK_24f16d2207b1dcb6ce07d81d20f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT "PK_24f16d2207b1dcb6ce07d81d20f" PRIMARY KEY (code);


--
-- Name: review PK_2e4299a343a81574217255c00ca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY (id);


--
-- Name: author PK_5a0e79799d372fe56f2f3fa6871; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY (id);


--
-- Name: wishlist PK_620bff4a240d66c357b5d820eaa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY (id);


--
-- Name: publisher PK_70a5936b43177f76161724da3e6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT "PK_70a5936b43177f76161724da3e6" PRIMARY KEY (id);


--
-- Name: category PK_9c4e4a89e3674fc9f382d733f03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY (id);


--
-- Name: wishlist_products_product PK_a40857fb518ea9ddd0eed914e04; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_products_product
    ADD CONSTRAINT "PK_a40857fb518ea9ddd0eed914e04" PRIMARY KEY ("wishlistId", "productId");


--
-- Name: product PK_bebc9158e480b949565b4dc7a82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY (id);


--
-- Name: cart PK_c524ec48751b9b5bcfbf6e59be7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: address PK_d92de1f82754668b5f5f5dd4fd5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY (id);


--
-- Name: admin PK_e032310bcef831fb83101899b10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY (id);


--
-- Name: provinces PK_f4b684af62d5cb3aa174f6b9b8a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "PK_f4b684af62d5cb3aa174f6b9b8a" PRIMARY KEY (code);


--
-- Name: coupon PK_fcbe9d72b60eed35f46dc35a682; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon
    ADD CONSTRAINT "PK_fcbe9d72b60eed35f46dc35a682" PRIMARY KEY (id);


--
-- Name: admin UQ_5e568e001f9d1b91f67815c580f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "UQ_5e568e001f9d1b91f67815c580f" UNIQUE (username);


--
-- Name: publisher UQ_9dc496f2e5b912da9edd2aa4455; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT "UQ_9dc496f2e5b912da9edd2aa4455" UNIQUE (name);


--
-- Name: author UQ_d3962fd11a54d87f927e84d1080; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT "UQ_d3962fd11a54d87f927e84d1080" UNIQUE (name);


--
-- Name: genre UQ_dd8cd9e50dd049656e4be1f7e8c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE (name);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: IDX_d26d172812ffce61522237f3ae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d26d172812ffce61522237f3ae" ON public.wishlist_products_product USING btree ("wishlistId");


--
-- Name: IDX_f732d2ee0684d55dbead923860; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f732d2ee0684d55dbead923860" ON public.wishlist_products_product USING btree ("productId");


--
-- Name: review FK_1337f93918c70837d3cea105d39; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: review FK_2a11d3c0ea1b2b5b1790f762b9a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "FK_2a11d3c0ea1b2b5b1790f762b9a" FOREIGN KEY ("productId") REFERENCES public.product(id);


--
-- Name: wards FK_3db519ef392b861a48648f91df7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT "FK_3db519ef392b861a48648f91df7" FOREIGN KEY ("provinceCode") REFERENCES public.provinces(code) ON DELETE CASCADE;


--
-- Name: address FK_4ba9d467035249d35073b26c034; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT "FK_4ba9d467035249d35073b26c034" FOREIGN KEY ("wardCode") REFERENCES public.wards(code);


--
-- Name: cart FK_756f53ab9466eb52a52619ee019; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: product FK_826d2d490a78e9439c3538c26df; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "FK_826d2d490a78e9439c3538c26df" FOREIGN KEY ("publisherId") REFERENCES public.publisher(id);


--
-- Name: product FK_8d38784dc5265dd8b91407b816b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "FK_8d38784dc5265dd8b91407b816b" FOREIGN KEY ("genreId") REFERENCES public.genre(id);


--
-- Name: order FK_caabe91507b3379c7ba73637b84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: address FK_d25f1ea79e282cc8a42bd616aa3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT "FK_d25f1ea79e282cc8a42bd616aa3" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: wishlist_products_product FK_d26d172812ffce61522237f3ae3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_products_product
    ADD CONSTRAINT "FK_d26d172812ffce61522237f3ae3" FOREIGN KEY ("wishlistId") REFERENCES public.wishlist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product FK_dddbf2ae70d3f6312a02458837a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "FK_dddbf2ae70d3f6312a02458837a" FOREIGN KEY ("authorId") REFERENCES public.author(id);


--
-- Name: wishlist FK_f6eeb74a295e2aad03b76b0ba87; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: wishlist_products_product FK_f732d2ee0684d55dbead923860c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_products_product
    ADD CONSTRAINT "FK_f732d2ee0684d55dbead923860c" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

