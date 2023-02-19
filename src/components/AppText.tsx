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

import styled, { css, DefaultTheme } from 'styled-components/native'

export interface AppTextProps {
  bold?: boolean
  semiBold?: boolean
  medium?: boolean
  color?: keyof DefaultTheme['font']
  size?: number
}

export default styled.Text<AppTextProps>`
  color: ${({ color, theme }) => theme.font[color || 'primary']};

  ${({ bold }) =>
    bold &&
    css`
      font-weight: 700;
    `}

  ${({ semiBold }) =>
    semiBold &&
    css`
      font-weight: 600;
    `}

  ${({ medium }) =>
    medium &&
    css`
      font-weight: 500;
    `}

  ${({ size }) =>
    size &&
    css`
      font-size: ${size}px;
    `}
`
