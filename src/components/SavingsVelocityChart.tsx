import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculateSavingsVelocity } from '../utils/stats';

interface SavingsVelocityChartProps {
  months?: number;
  type?: 'line' | 'bar';
}

export default function SavingsVelocityChart({ 
  months = 6, 
  type = 'bar' 
}: SavingsVelocityChartProps) {
  const { state } = useApp();
  const theme = useTheme();

  const chartData = useMemo(() => {
    return calculateSavingsVelocity(state.entries, months);
  }, [state.entries, months]);

  const totalSaved = chartData.reduce((sum, item) => sum + item.total, 0);
  const averageMonthlySavings = totalSaved / (chartData.length || 1);
  const highestMonth = chartData.reduce((max, item) => 
    item.total > max.total ? item : max, 
    chartData[0] || { month: '', total: 0 }
  );

  // Calculate trend
  const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2));
  const secondHalf = chartData.slice(Math.ceil(chartData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.total, 0) / (firstHalf.length || 1);
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.total, 0) / (secondHalf.length || 1);
  
  // Determine trend (only if there's meaningful data)
  let trend: 'up' | 'down' | 'stable' | 'no-data' = 'stable';
  if (firstHalfAvg === 0 && secondHalfAvg === 0) {
    trend = 'no-data';
  } else if (secondHalfAvg > firstHalfAvg) {
    trend = 'up';
  } else if (secondHalfAvg < firstHalfAvg) {
    trend = 'down';
  }
  
  const trendPercentage = firstHalfAvg > 0 
    ? Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(1)
    : '0.0';

  const trendMessages = {
    up: `📈 Trending up ${trendPercentage}%! Keep up the great work!`,
    down: `📉 Down ${trendPercentage}% from earlier. Time to boost savings!`,
    stable: '➡️ Steady savings rate. Consistency is key!',
    'no-data': '📊 Start saving to see your trends!',
  };

  const chartColor = theme.palette.mode === 'dark' ? '#7C3AED' : '#4F46E5';
  const gridColor = theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB';
  const textColor = theme.palette.text.primary;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Savings Velocity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your family's monthly savings over the last {months} months
        </Typography>

        {/* Chart */}
        <Box sx={{ width: '100%', height: 300, mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: textColor, fontSize: 12 }}
                  stroke={gridColor}
                />
                <YAxis 
                  tick={{ fill: textColor, fontSize: 12 }}
                  stroke={gridColor}
                  tickFormatter={(value) => `R${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${gridColor}`,
                    borderRadius: 8,
                  }}
                  formatter={(value: number | undefined) => value ? [`R${value.toFixed(2)}`, 'Saved'] : ['R0', 'Saved']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={{ fill: chartColor, r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Monthly Savings"
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: textColor, fontSize: 12 }}
                  stroke={gridColor}
                />
                <YAxis 
                  tick={{ fill: textColor, fontSize: 12 }}
                  stroke={gridColor}
                  tickFormatter={(value) => `R${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${gridColor}`,
                    borderRadius: 8,
                  }}
                  formatter={(value: number | undefined) => value ? [`R${value.toFixed(2)}`, 'Saved'] : ['R0', 'Saved']}
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  fill={chartColor}
                  radius={[8, 8, 0, 0]}
                  name="Monthly Savings"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Statistics */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Total ({months} months)
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              R{totalSaved.toFixed(2)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Monthly Average
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              R{averageMonthlySavings.toFixed(2)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Best Month
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="warning.main">
              R{highestMonth.total.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {highestMonth.month}
            </Typography>
          </Box>
        </Box>

        {/* Trend Message */}
        <Box 
          sx={{ 
            mt: 2, 
            p: 1.5, 
            bgcolor: trend === 'up' ? 'success.lighter' : 
                     trend === 'down' ? 'warning.lighter' : 
                     trend === 'no-data' ? 'grey.100' : 
                     'info.lighter',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="body2" 
            fontWeight="600"
            color={trend === 'up' ? 'success.dark' : 
                   trend === 'down' ? 'warning.dark' : 
                   trend === 'no-data' ? 'text.secondary' : 
                   'info.dark'}
          >
            {trendMessages[trend]}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
