import { useCallback, useEffect, useState } from 'react';
import { LogOut, Monitor, Smartphone } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button, IconButton } from '@/shared/ui/button';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { SkeletonRows, EmptyState, ErrorState } from '@/shared/ui/list';
import { getUserSessions, revokeUserSession, revokeAllUserSessions } from '@/entities/user';
import { describeUserAgent } from '@/shared/lib/user-agent';
import { toTimeElapsed } from '@/shared/lib/date';
import { logger } from '@/shared/lib/logger';
import styles from './UserSessions.module.css';

const dateFormat = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// Devices where the user is logged in. The admin can close them: the device is logged out
// at its next token refresh (within 15 minutes).
export default function UserSessions({ userId }) {
  const [sessions, setSessions] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  // session to revoke, or 'all'
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);

    return getUserSessions(userId)
      .then(setSessions)
      .catch((err) => {
        logger.error('Error loading sessions', err);
        setLoadError(err);
      });
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    getUserSessions(userId)
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
        }
      })
      .catch((err) => {
        logger.error('Error loading sessions', err);
        if (!cancelled) {
          setLoadError(err);
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  const others = sessions?.filter((s) => !s.current) ?? [];

  const handleConfirm = async () => {
    const target = confirm;
    setConfirm(null);
    setActionError(null);
    setBusy(true);

    try {
      if (target === 'all') {
        await revokeAllUserSessions(userId);
      } else {
        await revokeUserSession(userId, target.id);
      }
      await load();
    } catch (err) {
      logger.error('Error revoking sessions', err);
      setActionError(err);
    } finally {
      setBusy(false);
    }
  };

  const confirmTarget = confirm && confirm !== 'all' ? describeUserAgent(confirm.userAgent).label : null;

  return (
    <section className={styles.section} aria-labelledby="user-sessions-title">
      <div className={styles.header}>
        <div>
          <h2 id="user-sessions-title" className={styles.title}>Sesiones activas</h2>
          <p className={styles.subtitle}>
            Al cerrar una sesión, el dispositivo sale en menos de 15 minutos.
          </p>
        </div>

        {others.length > 1 && (
          <Button
            variant="secondary"
            size="sm"
            icon={LogOut}
            onClick={() => setConfirm('all')}
            disabled={busy}
          >
            Cerrar todas
          </Button>
        )}
      </div>

      <ActionError error={actionError} onClose={() => setActionError(null)} />

      <Card>
        {!sessions && !loadError && <SkeletonRows count={2} />}

        {loadError && (
          <ErrorState title="No se pudieron cargar las sesiones" error={loadError} onRetry={load} />
        )}

        {sessions?.length === 0 && (
          <EmptyState icon={Monitor} title="Sin sesiones activas" />
        )}

        {sessions?.map((session) => {
          const device = describeUserAgent(session.userAgent);
          const Icon = device.mobile ? Smartphone : Monitor;
          const ip = session.lastIp ?? session.createdIp;

          return (
            <div key={session.id} className={styles.row}>
              <div className={styles.icon}><Icon size={20} aria-hidden="true" /></div>

              <div className={styles.info}>
                <div className={styles.device}>
                  {device.label}
                  {session.current && <Badge tone="primary">Este dispositivo</Badge>}
                </div>
                <div className={styles.meta}>
                  {[ip && `IP ${ip}`, `Último uso: ${toTimeElapsed(session.lastUsedAt).text.toLowerCase()}`]
                    .filter(Boolean).join(' · ')}
                </div>
                <div className={styles.meta}>
                  Inició {dateFormat.format(new Date(session.createdAt))}
                  {session.createdIp && session.createdIp !== ip && ` desde ${session.createdIp}`}
                </div>
              </div>

              {!session.current && (
                <IconButton
                  icon={LogOut}
                  label="Cerrar sesión"
                  variant="danger"
                  onClick={() => setConfirm(session)}
                  disabled={busy}
                />
              )}
            </div>
          );
        })}
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title={confirm === 'all' ? 'Cerrar todas las sesiones' : 'Cerrar sesión'}
        message={confirm === 'all'
          ? 'Se cerrarán todas las sesiones de este usuario, salvo la tuya.'
          : `Se cerrará la sesión en ${confirmTarget}.`}
        confirmLabel="Cerrar sesión"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
