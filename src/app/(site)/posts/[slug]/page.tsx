import { redirect } from 'next/navigation';

interface OldPostRouteProps {
    params: { slug: string };
}

export default async function OldPostRoute({ params }: OldPostRouteProps) {
    const { slug } = await params;
    // Redirect to new route format
    redirect(`/${slug}`);
}
