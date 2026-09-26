// @ts-check
/**
 * API pública dos componentes do E-Financeiro Design System.
 * Importe sempre daqui — nunca do arquivo interno de um componente (regra de
 * lint no-restricted-imports):
 *
 *   import { Button, Card } from '../design-system/components/index.js';
 *
 * Cada fábrica recebe um objeto de props e devolve um elemento DOM pronto.
 * O CSS correspondente vem de design-system/ds.css.
 */

// Ações
export { Button } from './actions/Button.js';
export { IconButton } from './actions/IconButton.js';
export { SegmentedControl } from './actions/SegmentedControl.js';

// Formulários
export { Field } from './forms/Field.js';
export { Input } from './forms/Input.js';
export { SearchField } from './forms/SearchField.js';
export { Select } from './forms/Select.js';
export { Switch } from './forms/Switch.js';
export { Checkbox } from './forms/Checkbox.js';

// Exibição de dados
export { Card, CardHeader } from './data-display/Card.js';
export { StatCard } from './data-display/StatCard.js';
export { Badge } from './data-display/Badge.js';
export { Tag } from './data-display/Tag.js';
export { Avatar, UserChip } from './data-display/Avatar.js';
export { InsightCard } from './data-display/InsightCard.js';
export { DataTable } from './data-display/DataTable.js';
export { ListRow, IconTile } from './data-display/ListRow.js';

// Gráficos
export { Sparkline } from './charts/Sparkline.js';
export { AreaChart } from './charts/AreaChart.js';
export { DonutChart, DonutLegend } from './charts/DonutChart.js';
export { ScoreGauge } from './charts/ScoreGauge.js';
export { BarTicks } from './charts/BarTicks.js';

// Navegação
export { SidebarNav, NavItem } from './navigation/SidebarNav.js';
export { TopBar } from './navigation/TopBar.js';
export { Tabs } from './navigation/Tabs.js';
export { TabBar } from './navigation/TabBar.js';

// Feedback
export { ProgressBar } from './feedback/ProgressBar.js';
export { Dialog } from './feedback/Dialog.js';
export { Toast, exibirToast } from './feedback/Toast.js';
export { EmptyState } from './feedback/EmptyState.js';
