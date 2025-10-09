// src/components/pdf/TicketPDF.jsx
import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/formatters';
import { pdfStyles as styles } from './pdfStyles'; // Se importan los estilos compartidos

// La definición de 'styles' local ha sido eliminada

const TicketPDF = ({ businessData, saleData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>TICKET DE VENTA</Text>
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

      {/* Tabla de Productos CON PRECIOS */}
      <View style={styles.table}>
        <View style={styles.tableRow} fixed>
          <View style={{...styles.tableColHeader, flex: 0.8, textAlign: 'center'}}><Text style={styles.tableCellHeader}>Cant.</Text></View>
          <View style={{...styles.tableColHeader, flex: 3}}><Text style={styles.tableCellHeader}>Producto</Text></View>
          <View style={{...styles.tableColHeader, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCellHeader}>P. Unit.</Text></View>
          <View style={{...styles.tableColHeader, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCellHeader}>Subtotal</Text></View>
        </View>
        {saleData.items.map(item => (
          <View key={item.key} style={styles.tableRow} wrap={false}>
            <View style={{...styles.tableCol, flex: 0.8, textAlign: 'center'}}><Text style={styles.tableCell}>{item.quantity}</Text></View>
            <View style={{...styles.tableCol, flex: 3}}><Text style={styles.tableCell}>{item.name}</Text></View>
            <View style={{...styles.tableCol, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCell}>{formatCurrency(item.price)}</Text></View>
            <View style={{...styles.tableCol, flex: 1.5, textAlign: 'right'}}><Text style={styles.tableCell}>{formatCurrency(item.price * item.quantity)}</Text></View>
          </View>
        ))}
      </View>

      {/* Sección del Total */}
      <View style={styles.totalContainer}>
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>TOTAL:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(saleData.total)}</Text>
        </View>
      </View>
      
      <Text style={styles.companyNameFooter}>{businessData?.name || 'NOMBRE DE LA EMPRESA'}</Text>
      
      <Text style={styles.footer}>Comprobante de Venta No Válido como Factura. ¡Gracias por su compra!</Text>

    </Page>
  </Document>
);

export default TicketPDF;