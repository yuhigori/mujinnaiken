import { v4 as uuidv4 } from 'uuid';

export function generateToken(): string {
    return uuidv4();
}

export function verifyBasicAuth(authHeader: string | null): boolean {
    if (!authHeader) return false;

    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) return false;

    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'password';

    return username === adminUser && password === adminPass;
}

export function requireBasicAuth(): { status: number; headers: Record<string, string>; body: { error: string } } | null {
    return {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"'
        },
        body: { error: 'Authentication required' }
    };
}
