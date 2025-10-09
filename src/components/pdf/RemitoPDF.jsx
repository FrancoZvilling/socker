// src/components/pdf/RemitoPDF.jsx
import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles'; // Se importan los estilos compartidos

// La definición de 'styles' local ha sido eliminada

const RemitoPDF = ({ businessData, saleData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>REMITO</Text>
          <Text style={styles.headerSubtitle}>Nº Venta: {saleData.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>Fecha: {saleData.createdAt.toDate().toLocaleDateString()}</Text>
        </View>
        <View style={styles.logoContainer}>
          {businessData?.businessLogoUrl ? (
            <Image style={styles.logo} src={businessData.businessLogoUrl} />
          ) : (
            <Text style={{ fontSize: 10, color: '#AAA' }}>LOGO ACÁ</Text>
          )}
        </View>
      </View>

      {saleData.client && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'Times-Bold' }}>Cliente:</Text>
          <Text>{saleData.client.name}</Text>
        </View>
      )}

      {/* Tabla de Productos SIN PRECIOS */}
      <View style={styles.table}>
        <View style={styles.tableRow} fixed>
          <View style={{...styles.tableColHeader, flex: 1, textAlign: 'center'}}><Text style={styles.tableCellHeader}>Cantidad</Text></View>
          <View style={{...styles.tableColHeader, flex: 2}}><Text style={styles.tableCellHeader}>Código/SKU</Text></View>
          <View style={{...styles.tableColHeader, flex: 4}}><Text style={styles.tableCellHeader}>Descripción</Text></View>
        </View>
        {saleData.items.map(item => (
          <View key={item.key} style={styles.tableRow} wrap={false}>
            <View style={{...styles.tableCol, flex: 1, textAlign: 'center'}}><Text style={styles.tableCell}>{item.quantity}</Text></View>
            <View style={{...styles.tableCol, flex: 2}}><Text style={styles.tableCell}>{item.sku || 'N/A'}</Text></View>
            <View style={{...styles.tableCol, flex: 4}}><Text style={styles.tableCell}>{item.name}</Text></View>
          </View>
        ))}
      </View>

     
      
      <Text style={styles.companyNameFooter}>{businessData?.name || 'NOMBRE DE LA EMPRESA'}</Text>
      
      <Text style={styles.footer}>Documento no válido como factura.</Text>

    </Page>
  </Document>
);

export default RemitoPDF;