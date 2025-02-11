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

import { deriveNewAddressData, walletImportAsyncUnsafe } from '@alephium/sdk'

import { newAddressGenerated, syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { store } from '~/store/store'
import { AddressMetadata } from '~/types/addresses'
import { Mnemonic, WalletMetadata } from '~/types/wallet'
import { persistAddressesSettings } from '~/utils/addresses'
import { mnemonicToSeed } from '~/utils/crypto'

export const importAddresses = async (
  mnemonic: Mnemonic,
  walletId: WalletMetadata['id'],
  addressesMetadata: AddressMetadata[]
) => {
  const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, mnemonic)
  const addressHashes = []

  for (const { index, label, color, isDefault } of addressesMetadata) {
    const newAddressData = deriveNewAddressData(masterKey, undefined, index)
    const newAddress = { ...newAddressData, settings: { label, color, isDefault } }

    await persistAddressesSettings([newAddress], walletId)
    store.dispatch(newAddressGenerated(newAddress))

    addressHashes.push(newAddress.hash)
  }

  store.dispatch(syncAddressesData(addressHashes))
  store.dispatch(syncAddressesHistoricBalances(addressHashes))
}
