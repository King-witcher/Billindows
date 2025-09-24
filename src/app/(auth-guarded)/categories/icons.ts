import { SvgIconComponent } from '@mui/icons-material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalMallIcon from '@mui/icons-material/LocalMall'

export type CategoryIcon = {
  Component: SvgIconComponent
  name: string
}

export const ICONS: CategoryIcon[] = [
  {
    Component: AttachMoneyIcon,
    name: 'Money',
  },
  {
    Component: ShoppingCartIcon,
    name: 'Cart',
  },
  {
    Component: LocalMallIcon,
    name: 'Shop',
  },
]
