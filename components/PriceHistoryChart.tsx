import React from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import styles from "./PriceHistoryChart.styles";

interface PriceHistoryData {
  date: string;
  loosePrice?: number;
  cibPrice?: number;
  newPrice?: number;
  gradedPrice?: number;
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
  gameTitle: string;
}

export default function PriceHistoryChart({ data, gameTitle }: PriceHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊 No price history available yet</Text>
        <Text style={styles.emptySubtext}>Prices will be tracked when you access your collection</Text>
      </View>
    );
  }

  // Prepare data for the chart
  const labels = data.map((item) => {
    const d = new Date(item.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Prepare datasets for each price type
  const datasets: any[] = [];

  // Check if we have data for each price type
  const hasLoose = data.some((item) => item.loosePrice !== undefined && item.loosePrice > 0);
  const hasCib = data.some((item) => item.cibPrice !== undefined && item.cibPrice > 0);
  const hasNew = data.some((item) => item.newPrice !== undefined && item.newPrice > 0);
  const hasGraded = data.some((item) => item.gradedPrice !== undefined && item.gradedPrice > 0);

  if (hasLoose) {
    datasets.push({
      data: data.map((item) => item.loosePrice || 0),
      color: () => `rgba(14, 165, 233, 1)`, // blue-500
      strokeWidth: 2,
    });
  }

  if (hasCib) {
    datasets.push({
      data: data.map((item) => item.cibPrice || 0),
      color: () => `rgba(139, 92, 246, 1)`, // violet-500
      strokeWidth: 2,
    });
  }

  if (hasNew) {
    datasets.push({
      data: data.map((item) => item.newPrice || 0),
      color: () => `rgba(16, 185, 129, 1)`, // green-500
      strokeWidth: 2,
    });
  }

  if (hasGraded) {
    datasets.push({
      data: data.map((item) => item.gradedPrice || 0),
      color: () => `rgba(245, 158, 11, 1)`, // amber-500
      strokeWidth: 2,
    });
  }

  const screenWidth = Dimensions.get("window").width - 40;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price History - {gameTitle}</Text>

      {/* Legend */}
      <View style={styles.legend}>
        {hasLoose && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.looseColor]} />
            <Text style={styles.legendText}>Loose</Text>
          </View>
        )}
        {hasCib && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.cibColor]} />
            <Text style={styles.legendText}>CIB</Text>
          </View>
        )}
        {hasNew && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.newColor]} />
            <Text style={styles.legendText}>New</Text>
          </View>
        )}
        {hasGraded && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.gradedColor]} />
            <Text style={styles.legendText}>Graded</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <LineChart
          data={{
            labels: labels,
            datasets: datasets,
            legend: [], // We'll use custom legend
          }}
          width={Math.max(screenWidth, labels.length * 60)} // Dynamic width based on data points
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backgroundGradientFrom: "rgba(17,24,39,0.9)",
            backgroundGradientTo: "rgba(31,41,55,0.9)",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(103, 232, 249, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(103, 232, 249, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "rgba(6,182,212,0.5)",
            },
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
}
