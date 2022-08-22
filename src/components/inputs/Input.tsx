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

import { ReactNode, useEffect, useRef, useState } from 'react'
import { StyleProp, TextInput, TextInputProps, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import HighlightRow, { BorderOptions } from '../HighlightRow'

export type InputValue = string | number | undefined

export interface InputProps<T extends InputValue> extends Omit<TextInputProps, 'value'>, BorderOptions {
  value: T
  label: string
  onPress?: () => void
  resetDisabledColor?: boolean
  IconComponent?: ReactNode
  renderValue?: (value: T) => ReactNode
  style?: StyleProp<ViewStyle>
}

function Input<T extends InputValue>({
  label,
  style,
  value,
  isTopRounded,
  isBottomRounded,
  hasBottomBorder,
  onPress,
  resetDisabledColor,
  IconComponent,
  renderValue,
  ...props
}: InputProps<T>) {
  const theme = useTheme()
  const [isActive, setIsActive] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const renderedValue = renderValue ? renderValue(value) : value
  const showCustomValueRendering = typeof renderedValue !== 'string' && renderedValue !== undefined

  const labelStyle = useAnimatedStyle(() => ({
    top: withTiming(!isActive ? 0 : -35, { duration: 100 })
  }))

  const labelTextStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(!isActive ? 14 : 11, { duration: 100 })
  }))

  useEffect(() => {
    if (value && !isActive) {
      setIsActive(true)
    } else if (!value && isActive) {
      setIsActive(false)
    }
  }, [isActive, value])

  return (
    <HighlightRow
      isTopRounded={isTopRounded}
      isBottomRounded={isBottomRounded}
      hasBottomBorder={hasBottomBorder}
      onPress={onPress}
      isInput
      hasIcon={!!IconComponent}
      style={style}
    >
      <InputContainer>
        <Label style={labelStyle}>
          <LabelText style={labelTextStyle}>{label}</LabelText>
        </Label>
        {showCustomValueRendering && <CustomRenderedValue>{renderedValue}</CustomRenderedValue>}
        <TextInputStyled
          selectionColor={theme.gradient.yellow}
          value={renderedValue}
          onFocus={() => setIsActive(true)}
          onBlur={() => !renderedValue && setIsActive(false)}
          ref={inputRef}
          style={resetDisabledColor && !props.editable ? { color: theme.font.primary } : undefined}
          hide={showCustomValueRendering}
          {...props}
        />
      </InputContainer>
      {IconComponent}
    </HighlightRow>
  )
}

export default Input

const InputContainer = styled.View`
  position: relative;
  flex: 1;
`

const TextInputStyled = styled.TextInput<{ hide?: boolean }>`
  height: 100%;

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
`

const Label = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  justify-content: center;
`

const LabelText = styled(Animated.Text)`
  color: ${({ theme }) => theme.font.secondary};
  font-size: ${({ isActive }) => (!isActive ? 14 : 11)}px;
`

const CustomRenderedValue = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  height: 100%;
`
