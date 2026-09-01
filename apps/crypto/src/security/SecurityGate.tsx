import type {ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSecurityMonitor, type SecurityThreat} from './freeRaspConfig';

const THREAT_MESSAGES: Record<SecurityThreat, string> = {
  privilegedAccess:
    'Dispositivo con root/jailbreak detectado. Por seguridad, la app no puede continuar.',
  hooks: 'Se detectó un framework de hooking (Frida/Shadow). Acceso bloqueado.',
  appIntegrity: 'La integridad de la app fue comprometida.',
  debug: 'Modo debug detectado en un entorno de producción.',
  simulator: 'Ejecución en emulador detectada.',
  unofficialStore: 'Instalación desde tienda no oficial detectada.',
};

interface SecurityGateProps {
  children: ReactNode;
}

export function SecurityGate({children}: SecurityGateProps) {
  const {activeThreat} = useSecurityMonitor();

  if (activeThreat) {
    return (
      <View style={styles.blocked} testID="security-blocked">
        <Text style={styles.blockedTitle}>Acceso restringido</Text>
        <Text style={styles.blockedBody}>{THREAT_MESSAGES[activeThreat]}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  blockedTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  blockedBody: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
