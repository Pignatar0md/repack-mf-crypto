import {useCallback, useState} from 'react';
import {useFreeRasp} from 'freerasp-react-native';
import type {ThreatEventActions} from 'freerasp-react-native';

export type SecurityThreat =
  | 'privilegedAccess'
  | 'hooks'
  | 'appIntegrity'
  | 'debug'
  | 'simulator'
  | 'unofficialStore';

const threatActions: ThreatEventActions = {
  privilegedAccess: () => {},
  hooks: () => {},
  appIntegrity: () => {},
  debug: () => {},
  simulator: () => {},
  unofficialStore: () => {},
};

export function useSecurityMonitor() {
  const [activeThreat, setActiveThreat] = useState<SecurityThreat | null>(null);

  const handleThreat = useCallback((threat: SecurityThreat) => {
    if (__DEV__) {
      return;
    }

    setActiveThreat(threat);
  }, []);

  useFreeRasp(
    {
      androidConfig: {
        packageName: 'com.repackmf.crypto',
        certificateHashes: [''],
        supportedAlternativeStores: [],
      },
      iosConfig: {
        appBundleId: 'com.repackmf.crypto',
        appTeamId: '',
      },
      watcherMail: '',
      isProd: !__DEV__,
      killOnBypass: !__DEV__,
    },
    {
      ...threatActions,
      privilegedAccess: () => handleThreat('privilegedAccess'),
      hooks: () => handleThreat('hooks'),
      appIntegrity: () => handleThreat('appIntegrity'),
      debug: () => handleThreat('debug'),
      simulator: () => handleThreat('simulator'),
      unofficialStore: () => handleThreat('unofficialStore'),
    },
  );

  return {activeThreat};
}
