import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// ─────────────────────────────────────────────
// Clés localStorage — centralisées ici pour
// éviter les fautes de frappe partout
// ─────────────────────────────────────────────
const KEY_TOKEN     = 'token';
const KEY_ROLE      = 'role';
const KEY_USER_ID   = 'userId';
const KEY_LOGIN     = 'userLogin';
const KEY_CLIENT_ID = 'clientId';

// ─────────────────────────────────────────────
// Rôles métier (snake_case majuscule)
// correspondant exactement à ce que renvoie
// le backend NestJS
// ─────────────────────────────────────────────
export enum Role {
  ADMIN                  = 'ADMIN',
  CLIENT                 = 'CLIENT',
  TECHNICIEN             = 'TECHNICIEN',
  RECEPTION              = 'RECEPTION',
  RESPONSABLE_REPARATION = 'RESPONSABLE_REPARATION',
  ACHAT_STOCK            = 'ACHAT_STOCK',
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  // APPEL API
  // ─────────────────────────────────────────

  login(data: { login: string; motDePasse: string }) {
    return this.http.post<{
      token: string;
      role: string;
      userId: number;
      login: string;
      clientId?: number;
    }>(`${this.apiUrl}/login`, data);
  }

  // ─────────────────────────────────────────
  // SAUVEGARDE — écriture dans localStorage
  // ─────────────────────────────────────────

  /**
   * Sauvegarde le token JWT
   */
  saveToken(token: string): void {
    localStorage.setItem(KEY_TOKEN, token);
  }

  /**
   * Sauvegarde le rôle de l'utilisateur connecté.
   * Normalise en MAJUSCULES pour être robuste aux
   * variations renvoyées par le backend ('admin', 'ADMIN', etc.)
   */
  saveRole(role: string): void {
    localStorage.setItem(KEY_ROLE, role.toUpperCase().trim());
  }

  /**
   * Sauvegarde l'identifiant de l'utilisateur connecté
   */
  saveUserId(id: number | string): void {
    localStorage.setItem(KEY_USER_ID, String(id));
  }

  /**
   * Sauvegarde le login (utile pour l'affichage dans la navbar)
   */
  saveUserLogin(login: string): void {
    localStorage.setItem(KEY_LOGIN, login);
  }

  /**
   * Méthode principale appelée après un login réussi.
   * Sauvegarde token + rôle + userId + login en une seule opération.
   *
   * Fallback : si le backend ne renvoie pas le rôle directement,
   * on tente de le décoder depuis le payload du JWT.
   */
  saveClientId(id: number | string): void {
    localStorage.setItem(KEY_CLIENT_ID, String(id));
  }

  getClientId(): number | null {
    const val = localStorage.getItem(KEY_CLIENT_ID);
    return val ? Number(val) : null;
  }

  saveSession(
    token: string,
    role?: string,
    userId?: number | string,
    login?: string,
    clientId?: number | string
  ): void {

    this.saveToken(token);

    const resolvedRole = role ?? this.extractRoleFromToken(token);
    if (resolvedRole) {
      this.saveRole(resolvedRole);
    }

    const resolvedId = userId ?? this.extractFieldFromToken(token, 'sub')
                                ?? this.extractFieldFromToken(token, 'id');
    if (resolvedId !== undefined && resolvedId !== null) {
      this.saveUserId(resolvedId);
    }

    if (login) {
      this.saveUserLogin(login);
    }

    // clientId : depuis la réponse OU depuis le JWT (pour les comptes CLIENT)
    const resolvedClientId = clientId
      ?? (this.extractFieldFromToken(token, 'clientId') as number | null);
    if (resolvedClientId !== undefined && resolvedClientId !== null) {
      this.saveClientId(resolvedClientId);
    }
  }

  // ─────────────────────────────────────────
  // LECTURE — getters depuis localStorage
  // ─────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(KEY_TOKEN);
  }

  /** Retourne le rôle persisté, ex : 'ADMIN', 'TECHNICIEN' … */
  getRole(): string | null {
    return localStorage.getItem(KEY_ROLE);
  }

  getUserId(): number | null {
    const val = localStorage.getItem(KEY_USER_ID);
    return val ? Number(val) : null;
  }

  getUserLogin(): string | null {
    return localStorage.getItem(KEY_LOGIN);
  }

  /** Vrai si un token est présent en session */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ─────────────────────────────────────────
  // DÉCONNEXION
  // ─────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_ROLE);
    localStorage.removeItem(KEY_USER_ID);
    localStorage.removeItem(KEY_LOGIN);
    localStorage.removeItem(KEY_CLIENT_ID);
  }

  // ─────────────────────────────────────────
  // VÉRIFICATION DE RÔLE
  // ─────────────────────────────────────────

  isAdmin(): boolean {
    return this.getRole() === Role.ADMIN;
  }

  isTechnicien(): boolean {
    return this.getRole() === Role.TECHNICIEN;
  }

  isClient(): boolean {
    return this.getRole() === Role.CLIENT;
  }

  isAchatStock(): boolean {
    return this.getRole() === Role.ACHAT_STOCK;
  }

  isResponsableReparation(): boolean {
    return this.getRole() === Role.RESPONSABLE_REPARATION;
  }

  isReception(): boolean {
    return this.getRole() === Role.RECEPTION;
  }

  /**
   * Vrai si l'utilisateur possède au moins un des rôles fournis.
   * Utilisation : hasRole([Role.ADMIN, Role.TECHNICIEN])
   */
  hasRole(roles: Role[]): boolean {
    const current = this.getRole();
    return roles.some(r => r === current);
  }

  // ─────────────────────────────────────────
  // DÉCODAGE JWT (sans librairie externe)
  // ─────────────────────────────────────────

  /**
   * Décode le payload d'un JWT (base64url → JSON).
   * Ne vérifie PAS la signature — côté frontend c'est normal,
   * la vérification est faite par le backend.
   */
  decodeToken(token?: string): Record<string, any> | null {
    const t = token ?? this.getToken();
    if (!t) return null;

    try {
      const parts = t.split('.');
      if (parts.length !== 3) return null;

      // base64url → base64 standard → atob → JSON
      const base64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded = base64.padEnd(
        base64.length + (4 - (base64.length % 4)) % 4,
        '='
      );

      const json = atob(padded);
      return JSON.parse(json);

    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────
  // HELPERS PRIVÉS
  // ─────────────────────────────────────────

  /** Extrait le rôle depuis le payload JWT (champ 'role') */
  private extractRoleFromToken(token: string): string | null {
    return this.extractFieldFromToken(token, 'role') as string | null;
  }

  /** Extrait n'importe quel champ depuis le payload JWT */
  private extractFieldFromToken(
    token: string,
    field: string
  ): string | number | null {
    const payload = this.decodeToken(token);
    return payload ? payload[field] ?? null : null;
  }
}
