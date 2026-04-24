import { Head, Link } from "vite-react-ssg";
import { Container } from "../components/Container";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 — Azafaran</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="min-h-screen grid place-items-center">
        <Container className="text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            404
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">
            Página no encontrada
          </h1>
          <p className="mt-3 text-muted-foreground">
            La página que buscas no existe o ha cambiado de dirección.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Volver al inicio
          </Link>
        </Container>
      </main>
    </>
  );
}
