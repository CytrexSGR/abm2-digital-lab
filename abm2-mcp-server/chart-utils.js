/**
 * ASCII Chart Utilities
 * Generates text-based charts for terminal/markdown display
 */

/**
 * Generate a simple ASCII sparkline
 * @param {Array<number>} data - Data points
 * @param {number} width - Chart width in characters
 * @returns {string} - ASCII sparkline
 */
function generateSparkline(data, width = 50) {
    if (!data || data.length === 0) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    if (range === 0) return '▄'.repeat(width);

    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

    return data.map(val => {
        const normalized = (val - min) / range;
        const index = Math.floor(normalized * (chars.length - 1));
        return chars[index];
    }).join('');
}

/**
 * Generate ASCII bar chart
 * @param {Object} data - Key-value pairs {label: value}
 * @param {Object} options - Chart options
 * @returns {string} - ASCII bar chart
 */
function generateBarChart(data, options = {}) {
    const {
        maxWidth = 40,
        showValues = true,
        sort = false
    } = options;

    let entries = Object.entries(data);

    if (sort) {
        entries.sort((a, b) => b[1] - a[1]);
    }

    const maxValue = Math.max(...entries.map(e => e[1]));
    const maxLabelLen = Math.max(...entries.map(e => e[0].length));

    let chart = '';
    entries.forEach(([label, value]) => {
        const barLength = Math.round((value / maxValue) * maxWidth);
        const bar = '█'.repeat(barLength);
        const paddedLabel = label.padEnd(maxLabelLen);
        const valueStr = showValues ? ` ${value}` : '';
        chart += `${paddedLabel} │${bar}${valueStr}\n`;
    });

    return chart;
}

/**
 * Generate ASCII line chart
 * @param {Array<number>} data - Data points
 * @param {Object} options - Chart options
 * @returns {string} - ASCII line chart
 */
function generateLineChart(data, options = {}) {
    const {
        height = 10,
        width = 60,
        showAxis = true,
        label = ''
    } = options;

    if (!data || data.length === 0) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    if (range === 0) {
        return `${label} (constant): ${min.toFixed(2)}`;
    }

    // Create grid
    const grid = Array(height).fill().map(() => Array(width).fill(' '));

    // Plot points
    data.forEach((value, index) => {
        const x = Math.floor((index / (data.length - 1)) * (width - 1));
        const y = height - 1 - Math.floor(((value - min) / range) * (height - 1));

        if (grid[y] && grid[y][x] !== undefined) {
            grid[y][x] = '●';
        }
    });

    // Connect points with lines
    for (let i = 0; i < data.length - 1; i++) {
        const x1 = Math.floor((i / (data.length - 1)) * (width - 1));
        const y1 = height - 1 - Math.floor(((data[i] - min) / range) * (height - 1));
        const x2 = Math.floor(((i + 1) / (data.length - 1)) * (width - 1));
        const y2 = height - 1 - Math.floor(((data[i + 1] - min) / range) * (height - 1));

        // Draw line between points
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let step = 0; step <= steps; step++) {
            const x = Math.round(x1 + (x2 - x1) * (step / steps));
            const y = Math.round(y1 + (y2 - y1) * (step / steps));
            if (grid[y] && grid[y][x] !== undefined && grid[y][x] === ' ') {
                grid[y][x] = '·';
            }
        }
    }

    // Build chart string
    let chart = '';
    if (label) {
        chart += `${label}\n`;
    }

    grid.forEach((row, i) => {
        const yValue = max - (i / (height - 1)) * range;
        const yLabel = showAxis ? `${yValue.toFixed(1).padStart(6)} │ ` : '';
        chart += yLabel + row.join('') + '\n';
    });

    if (showAxis) {
        chart += '       └' + '─'.repeat(width) + '\n';
        chart += `        ${min.toFixed(1).padEnd(10)}${max.toFixed(1).padStart(width - 10)}\n`;
    }

    return chart;
}

/**
 * Generate histogram
 * @param {Array<number>} data - Data points
 * @param {number} bins - Number of bins
 * @returns {string} - ASCII histogram
 */
function generateHistogram(data, bins = 10) {
    if (!data || data.length === 0) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const binWidth = range / bins;

    // Create bins
    const binCounts = Array(bins).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
        binCounts[binIndex]++;
    });

    // Create histogram
    const maxCount = Math.max(...binCounts);
    const barMaxWidth = 40;

    let chart = '';
    binCounts.forEach((count, i) => {
        const binStart = min + (i * binWidth);
        const binEnd = binStart + binWidth;
        const barLength = Math.round((count / maxCount) * barMaxWidth);
        const bar = '█'.repeat(barLength);
        chart += `${binStart.toFixed(0).padStart(6)}-${binEnd.toFixed(0).padEnd(6)} │${bar} ${count}\n`;
    });

    return chart;
}

/**
 * Generate trend indicator
 * @param {number} change - Change value
 * @param {number} threshold - Threshold for significant change
 * @returns {string} - Trend indicator with emoji
 */
function getTrendIndicator(change, threshold = 0.001) {
    if (Math.abs(change) < threshold) {
        return '➡️  Stable';
    } else if (change > 0) {
        return `📈 Increasing (+${change.toFixed(3)})`;
    } else {
        return `📉 Decreasing (${change.toFixed(3)})`;
    }
}

/**
 * Create a simple box/table
 * @param {Array<Array<string>>} rows - Table rows
 * @param {Array<string>} headers - Column headers
 * @returns {string} - ASCII table
 */
function generateTable(rows, headers = []) {
    if (!rows || rows.length === 0) return '';

    // Calculate column widths
    const colWidths = [];
    const allRows = headers.length > 0 ? [headers, ...rows] : rows;

    allRows.forEach(row => {
        row.forEach((cell, i) => {
            const len = String(cell).length;
            colWidths[i] = Math.max(colWidths[i] || 0, len);
        });
    });

    // Build table
    let table = '';

    // Top border
    table += '┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐\n';

    // Headers
    if (headers.length > 0) {
        table += '│ ' + headers.map((h, i) => String(h).padEnd(colWidths[i])).join(' │ ') + ' │\n';
        table += '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤\n';
    }

    // Rows
    rows.forEach(row => {
        table += '│ ' + row.map((cell, i) => String(cell).padEnd(colWidths[i])).join(' │ ') + ' │\n';
    });

    // Bottom border
    table += '└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘\n';

    return table;
}

module.exports = {
    generateSparkline,
    generateBarChart,
    generateLineChart,
    generateHistogram,
    getTrendIndicator,
    generateTable
};
