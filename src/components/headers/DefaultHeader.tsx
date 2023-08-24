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

import { ReactNode } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import Animated, { Easing, interpolateColor, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useScrollContext } from '~/contexts/ScrollContext'

export interface DefaultHeaderProps {
  HeaderLeft: ReactNode
  HeaderRight?: ReactNode
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const scrollRange = [0, 50]

const DefaultHeader = ({ HeaderRight, HeaderLeft, bgColor, style }: DefaultHeaderProps) => {
  const theme = useTheme()
  const { scrollY, scrollToTop } = useScrollContext()

  const bgColorRange = [bgColor ?? theme.bg.primary, theme.bg.secondary]
  const borderColorRange = ['transparent', theme.border.secondary]
  const insets = useSafeAreaInsets()

  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(interpolateColor(scrollY?.value || 0, scrollRange, bgColorRange), {
      duration: 1000,
      easing: Easing.ease
    }),
    borderColor: interpolateColor(scrollY?.value || 0, scrollRange, borderColorRange)
  }))

  return (
    <Pressable onPress={() => scrollToTop && scrollToTop()}>
      <Animated.View style={[style, headerStyle, { paddingTop: insets.top + 15 }]}>
        {typeof HeaderLeft === 'string' ? <Title>{HeaderLeft}</Title> : HeaderLeft}
        {HeaderRight}
      </Animated.View>
    </Pressable>
  )
}

export default styled(DefaultHeader)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
`

const Title = styled(AppText)`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.primary};
`
