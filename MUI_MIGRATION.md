# Material-UI Migration Guide

## Completed

### Dependencies
- ✅ Removed Tailwind CSS, autoprefixer, postcss, @tailwindcss/postcss
- ✅ Removed @heroicons/react
- ✅ Installed @mui/material, @mui/x-data-grid, @mui/x-date-pickers, @mui/icons-material
- ✅ Installed @emotion/react and @emotion/styled (required peer dependencies)

### Configuration Files
- ✅ Removed `tailwind.config.js`
- ✅ Removed `postcss.config.js`
- ✅ Updated `index.css` to remove Tailwind directives

### Components Converted to MUI
- ✅ **App.tsx** - Added ThemeProvider and CssBaseline
- ✅ **AuthPage.tsx** - Converted to use MUI Card, Select, Button, Typography
- ✅ **Layout.tsx** - Converted to use MUI AppBar, Toolbar, Tabs, Avatar
- ✅ **Dashboard.tsx** - Converted to use MUI Card, Box, LinearProgress, Chip

### Still Using Tailwind Classes (Need Conversion)
- ⚠️ **Goals.tsx** - Needs full conversion to MUI
- ⚠️ **Savings.tsx** - Needs full conversion to MUI

## MUI Component Mapping Reference

### Common Conversions
- `className="..."` → `sx={{...}}` (MUI styling prop)
- `<div>` → `<Box>` (MUI container component)
- Tailwind classes → MUI `sx` prop with theme values

### Layout & Structure
- `className="flex"` → `sx={{ display: 'flex' }}`
- `className="grid grid-cols-X"` → `sx={{ display: 'grid', gridTemplateColumns: 'repeat(X, 1fr)' }}`
- `className="space-y-4"` → `sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}`

### Typography
- `<h1 className="text-3xl font-bold">` → `<Typography variant="h4" fontWeight="bold">`
- `<p className="text-gray-600">` → `<Typography variant="body1" color="text.secondary">`

### Colors
- `text-primary-600` → `color="primary"`
- `bg-white` → `sx={{ bgcolor: 'background.paper' }}`
- `text-gray-900` → `color="text.primary"`
- `text-gray-500` → `color="text.secondary"`

### Spacing
- `p-4` → `sx={{ p: 2 }}` (MUI uses 8px base spacing)
- `px-6 py-4` → `sx={{ px: 3, py: 2 }}`
- `mb-4` → `sx={{ mb: 2 }}`

### Buttons
- `<button className="...">` → `<Button variant="contained|outlined|text">`

### Forms
- `<input className="...">` → `<TextField>`
- `<select>` → `<Select>` with `<MenuItem>`

### Icons
Heroicons → MUI Icons Material:
- `HomeIcon` → `Home`
- `ChartBarIcon` → `BarChart`
- `CurrencyDollarIcon` → `AccountBalance`
- `ArrowRightOnRectangleIcon` → `Logout`
- `UserCircleIcon` → `AccountCircle`
- `PlusIcon` → `Add`
- `PencilIcon` → `Edit`
- `TrashIcon` → `Delete`

## Theme Configuration

Current theme (in App.tsx):
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue
    },
    secondary: {
      main: '#16a34a', // Green
    },
  },
});
```

## Next Steps

1. Convert **Goals.tsx** to use MUI components
2. Convert **Savings.tsx** to use MUI components
3. Test all functionality
4. Optional: Add MUI X DataGrid for better table management
5. Optional: Add MUI X Date Pickers for date inputs
