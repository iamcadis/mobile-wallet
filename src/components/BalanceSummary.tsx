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

import { calculateAmountWorth } from '@alephium/sdk'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { Skeleton } from 'moti/skeleton'
import { useState } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import DeltaPercentage from '~/components/DeltaPercentage'
import HistoricWorthChart from '~/components/HistoricWorthChart'
import { useAppSelector } from '~/hooks/redux'
import {
  selectAddressesHaveHistoricBalances,
  selectHaveHistoricBalancesLoaded
} from '~/store/addresses/addressesSelectors'
import { selectTotalBalance } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { BORDER_RADIUS_BIG, HORIZONTAL_MARGIN } from '~/style/globalStyle'
import { ChartLength, chartLengths, DataPoint } from '~/types/charts'
import { NetworkStatus } from '~/types/network'
import { currencies } from '~/utils/currencies'

interface BalanceSummaryProps {
  dateLabel: string
  style?: StyleProp<ViewStyle>
}

const BalanceSummary = ({ dateLabel, style }: BalanceSummaryProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const networkStatus = useAppSelector((s) => s.network.status)
  const networkName = useAppSelector((s) => s.network.name)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: totalBalance === BigInt(0)
  })
  const isLoadingBalances = useAppSelector((s) => s.addresses.loadingBalances)
  const haveHistoricBalancesLoaded = useAppSelector(selectHaveHistoricBalancesLoaded)
  const hasHistoricBalances = useAppSelector(selectAddressesHaveHistoricBalances)
  const theme = useTheme()

  const [chartLength, setChartLength] = useState<ChartLength>('1m')
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const totalAmountWorth = calculateAmountWorth(totalBalance, price ?? 0)

  const initialValue = worthInBeginningOfChart || 0
  const latestValue = totalAmountWorth

  const deltaPercentage = Math.round(((latestValue - initialValue) / initialValue) * 10000) / 100
  const deltaColor = !deltaPercentage
    ? theme.bg.tertiary
    : deltaPercentage < 0
    ? theme.global.alert
    : theme.global.valid

  return (
    <BalanceSummaryContainer colors={['transparent', colord(deltaColor).alpha(0.2).toHex()]} locations={[0, 0.6]}>
      <TextContainer>
        <SurfaceHeader>
          <AppText color="tertiary" semiBold>
            {dateLabel}
          </AppText>
          <ActiveNetwork>
            <NetworkStatusBullet status={networkStatus} />
            <AppText color="primary">{networkName}</AppText>
          </ActiveNetwork>
        </SurfaceHeader>
        <Skeleton show={isPriceLoading || isLoadingBalances} colorMode={theme.name}>
          <Amount value={totalAmountWorth} isFiat fadeDecimals suffix={currencies[currency].symbol} bold size={38} />
        </Skeleton>
        {(!haveHistoricBalancesLoaded || (hasHistoricBalances && worthInBeginningOfChart !== undefined)) && (
          <Row>
            <Skeleton show={!haveHistoricBalancesLoaded} colorMode={theme.name}>
              <DeltaPercentage percentage={deltaPercentage} />
            </Skeleton>
            <ChartLengthBadges>
              {chartLengths.map((length) => {
                const isActive = length === chartLength

                return (
                  <ChartLengthButton key={length} isActive={isActive} onPress={() => setChartLength(length)}>
                    <AppText color={isActive ? 'contrast' : 'secondary'} size={14} medium>
                      {length.toUpperCase()}
                    </AppText>
                  </ChartLengthButton>
                )
              })}
            </ChartLengthBadges>
          </Row>
        )}
      </TextContainer>

      <ChartContainer>
        <HistoricWorthChart
          currency={currency}
          latestWorth={totalAmountWorth}
          length={chartLength}
          onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
        />
      </ChartContainer>
    </BalanceSummaryContainer>
  )
}

export default BalanceSummary

const BalanceSummaryContainer = styled(LinearGradient)`
  margin: 0 ${HORIZONTAL_MARGIN}px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.primary};
`

const TextContainer = styled.View`
  margin: 5px ${HORIZONTAL_MARGIN}px;
`

const ChartContainer = styled.View`
  margin-bottom: -1px;
  margin-right: -1px;
  margin-left: -1px;
`

const ChartLengthBadges = styled.View`
  flex-direction: row;
  gap: 12px;
`

const ChartLengthButton = styled(Pressable)<{ isActive?: boolean }>`
  width: 32px;
  height: 23px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.font.secondary : 'transparent')};
`

const Row = styled.View`
  flex-direction: row;
  gap: 24px;
  margin: 10px 0;
`

const SurfaceHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 9px;
`

const ActiveNetwork = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 33px;
  background-color: ${({ theme }) => theme.bg.back1};
`

const NetworkStatusBullet = styled.View<{ status: NetworkStatus }>`
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background-color: ${({ status, theme }) => (status === 'online' ? theme.global.valid : theme.global.alert)};
`
