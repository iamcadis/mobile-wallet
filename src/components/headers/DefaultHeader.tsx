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
import { StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { useInWalletLayoutContext } from '../../contexts/InWalletLayoutContext'
import useHeaderScrollStyle from '../../hooks/layout/useHeaderScrollStyle'
import Text from '../Text'

interface DefaultHeaderProps {
  HeaderLeft: Omit<ReactNode, 'null' | 'undefined'>
  HeaderRight?: ReactNode
  style?: StyleProp<ViewStyle>
}

const DefaultHeader = ({ HeaderRight, HeaderLeft, style }: DefaultHeaderProps) => {
  const { scrollY } = useInWalletLayoutContext()
  const headerStyle = useHeaderScrollStyle(scrollY)

  return (
    <Animated.View style={[style, headerStyle]}>
      <>
        {typeof HeaderLeft === 'string' ? <Title>{HeaderLeft}</Title> : HeaderLeft}
        {HeaderRight}
      </>
    </Animated.View>
  )
}

export default styled(DefaultHeader)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 40px 20px 10px 20px;
`

const Title = styled(Text)`
  font-size: 26px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
`
