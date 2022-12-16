/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { isEnrolledAsync } from 'expo-local-authentication'
import { useCallback, useEffect, useRef } from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'

import {
  areThereOtherWallets,
  disableBiometrics,
  getActiveWalletMetadata,
  getStoredActiveWallet
} from '../persistent-storage/wallets'
import { appBecameInactive } from '../store/actions'
import { biometricsDisabled } from '../store/activeWalletSlice'
import { navigateRootStack, useRestoreNavigationState } from '../utils/navigation'
import { useAppDispatch, useAppSelector } from './redux'
import useSwitchWallet from './useSwitchWallet'

export const useAppStateChange = () => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const [activeWallet, lastNavigationState, isCameraOpen, addressesStatus] = useAppSelector((s) => [
    s.activeWallet,
    s.appMetadata.lastNavigationState,
    s.appMetadata.isCameraOpen,
    s.addresses.status
  ])
  const restoreNavigationState = useRestoreNavigationState()
  const switchWallet = useSwitchWallet()

  const unlockWallet = useCallback(async () => {
    const hasAvailableBiometrics = await isEnrolledAsync()

    try {
      const activeWalletMetadata = await getActiveWalletMetadata()

      // Disable biometrics if needed
      if (activeWalletMetadata && activeWalletMetadata.authType === 'biometrics' && !hasAvailableBiometrics) {
        await disableBiometrics(activeWalletMetadata.id)
        dispatch(biometricsDisabled())
      }

      const storedWallet = await getStoredActiveWallet()

      if (!storedWallet) {
        if (await areThereOtherWallets()) {
          navigateRootStack('SwitchWalletAfterDeletionScreen')
        } else if (lastNavigationState) {
          restoreNavigationState()
        } else {
          navigateRootStack('LandingScreen')
        }
        return
      }

      if (storedWallet.authType === 'pin') {
        navigateRootStack('LoginScreen', { walletIdToLogin: storedWallet.metadataId })
        return
      }

      if (storedWallet.authType === 'biometrics') {
        const requiresAddressInitialization = addressesStatus === 'uninitialized'
        await switchWallet(storedWallet, requiresAddressInitialization)

        restoreNavigationState()
      }
      // TODO: Revisit error handling with proper error codes
    } catch (e: unknown) {
      const error = e as { message?: string }
      if (error.message === 'User canceled the authentication') {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: unlockWallet }
        ])
      } else {
        console.error(e)
      }
    }
  }, [addressesStatus, dispatch, lastNavigationState, restoreNavigationState, switchWallet])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/) && !isCameraOpen) {
        dispatch(appBecameInactive())
      } else if (nextAppState === 'active' && !activeWallet.mnemonic) {
        unlockWallet()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return subscription.remove
  }, [activeWallet.mnemonic, dispatch, isCameraOpen, unlockWallet])
}
