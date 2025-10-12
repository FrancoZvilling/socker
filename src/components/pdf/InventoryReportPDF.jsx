// src/components/pdf/InventoryReportPDF.jsx
import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/formatters';
import { pdfStyles as styles } from './pdfStyles'; // Reutilizamos los estilos

const InventoryReportPDF = ({ businessData, products, title }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Reporte de Inventario</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Generado el: {new Date().toLocaleDateString()}</Text>
        </View>
        {businessData?.businessLogoUrl && (
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src={businessData.businessLogoUrl} />
          </View>
        )}
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow} fixed>
          <View style={{...styles.tableColHeader, flex: 3}}><Text style={styles.tableCellHeader}>Producto</Text></View>
          <View style={{...styles.tableColHeader, flex: 1, textAlign: 'center'}}><Text style={styles.tableCellHeader}>Stock</Text></View>
          <View style={{...styles.tableColHeader, flex: 1, textAlign: 'center'}}><Text style={styles.tableCellHeader}>Stock Mín.</Text></View>
          <View style={{...styles.tableColHeader, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCellHeader}>P. Costo</Text></View>
          <View style={{...styles.tableColHeader, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCellHeader}>P. Venta</Text></View>
        </View>
        {(products || []).map(product => (
          <View key={product.id} style={styles.tableRow} wrap={false}>
            <View style={{...styles.tableCol, flex: 3}}><Text style={styles.tableCell}>{product.name}</Text></View>
            <View style={{...styles.tableCol, flex: 1, textAlign: 'center'}}><Text style={styles.tableCell}>{product.stock}</Text></View>
            <View style={{...styles.tableCol, flex: 1, textAlign: 'center'}}><Text style={styles.tableCell}>{product.minStock || 0}</Text></View>
            <View style={{...styles.tableCol, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCell}>{formatCurrency(product.costPrice || 0)}</Text></View>
            <View style={{...styles.tableCol, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCell}>{formatCurrency(product.price || 0)}</Text></View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Reporte generado por Stocker - {businessData?.name || ''}
      </Text>
    </Page>
  </Document>
);

export default InventoryReportPDF;