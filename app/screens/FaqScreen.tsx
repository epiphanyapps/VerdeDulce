import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { ViewStyle, View, TextStyle } from "react-native";
// import { AppStackScreenProps } from "../../app/navigators";
import { Footer, OrderButton, Screen, Text } from "../../components";
import { colors, spacing, typography } from "../../app/theme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { useStores } from "../../app/models"
import { linkToWhatsAppCatalog } from "../utils/linkbuilder";

export const FaqScreen: FC = observer(function FaqScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => {
          return (
            <OrderButton
              style={{ marginRight: spacing.sm }}
              tx="landingScreen.order"
              icon="arrow-forward"
              onPress={() => {
                linkToWhatsAppCatalog();
              }}
            />
          );
        },
      });
    }, [navigation])
  );

  return (
    <Screen style={$root} preset="scroll">
      <View style={{ height: "100%" }}>
        <Text
          text="Preguntas Frecuentes"
          preset="heading"
          style={{
            fontFamily: typography.fonts.poppins.light,
            textAlign: "center",
            margin: spacing.md,
            color: colors.palette.greenFont,
          }}
        />
        <View style={$item}>
          <Text
            text="¿Qué es Verde Dulce?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Verde Dulce es un restaurante de comida rápida y saludable que se enfoca en comidas frescas, nutritivas y sostenibles. Nos especializamos en ensaladas personalizables, bowls de granos y platos de temporada, elaborados con ingredientes locales para ofrecerte opciones saludables y sabrosas."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="Cuales son los metodos de pago?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Aceptamos efectivo y tranferencia por Pichincha."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="¿Cómo puedo hacer un pedido?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Puedes pedir a través de nuestro sitio web en verdedulce.com. Clique en el boton de ordenar y gestiona su orden por whatsapp."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="Puedo personalizar mi pedido?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="¡Por supuesto! Puedes armar tu propio bowl o ensalada eligiendo entre una variedad de hojas verdes, granos, proteínas y toppings. También ofrecemos una selección de aderezos caseros para realzar tu comida."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="¿Cómo puedo ver la información nutricional de sus comidas?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Puedes ver información nutricional detallada de cada uno de nuestros platos en nuestro sitio web o en nuestra aplicación móvil. Creemos en la transparencia, por lo que proporcionamos toda la información que necesitas para tomar decisiones informadas."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="¿Ofrecen servicios de catering?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Sí, Verde Dulce ofrece catering para eventos, reuniones y fiestas. Puedes elegir de nuestro menú o trabajar con nosotros para crear un menú personalizado que se adapte a las necesidades de tu evento. Visita nuestra página de catering para más detalles y para hacer un pedido."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="¿En qué áreas ofrecen entrega?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Hacemos servicio a domicilio, a las parrocias 12 de Marzo, 18 de octubre, Portoviejo, y Andres de Vera."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text=" ¿Cuáles son sus horarios de atención?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="Estamos abiertos de 11:00 AM a 7:00 PM, Lunes a Viernes."
            style={$content}
          />
        </View>
        <View style={$item}>
          <Text
            text="¿Cómo puedo dejar un comentario o reportar un problema?"
            preset="subheading"
            style={$title}
          />
          <Text
            text="¡Valoramos tus comentarios! Escríbenos por WhatsApp; es la forma más rápida de
        llegar a nosotros. Siempre estamos buscando formas de mejorar tu experiencia."
            style={$content}
          />
        </View>
      </View>
      <Footer />
    </Screen>
  );
});

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.lightBackground,
};

const $item: ViewStyle = {
  flexDirection: "column",
  margin: spacing.md,
  borderBottomWidth: 0.5,
  borderBottomColor: colors.palette.veryDarkGreen,
  paddingBottom: spacing.md,
};
/*

        9. ¿Qué prácticas sostenibles sigue Verde Dulce? La sostenibilidad es fundamental para
        nuestra misión. Usamos envases ecológicos, obtenemos nuestros ingredientes de granjas
        locales y sostenibles, y trabajamos para minimizar los desperdicios en nuestras cocinas.
        También alentamos a los clientes a usar bowls y utensilios reutilizables siempre que sea
        posible. 10. ¿En qué áreas ofrecen entrega? Nuestro servicio de entrega está disponible
        dentro de un radio específico de cada una de nuestras ubicaciones. Puedes verificar si
        entregamos en tu área ingresando tu dirección en nuestro sitio web o aplicación. 11. ¿Cómo
        puedo rastrear mi pedido? Después de realizar un pedido, recibirás una confirmación con un
        tiempo estimado de entrega. Puedes rastrear tu entrega a través de la aplicación o el sitio
        web para ver su estado en tiempo real. 12. ¿Ofrecen un programa de recompensas? ¡Sí! Verde
        Dulce tiene un programa de lealtad. Cada vez que ordenas, ganas puntos que puedes canjear
        por descuentos, comidas gratis y otras recompensas. Regístrate a través de nuestra
        aplicación o en línea para comenzar a ganar puntos. 13. 14. ¿Qué métodos de pago aceptan?
        Aceptamos todas las principales tarjetas de crédito y débito, así como opciones de pago
        móvil como Apple Pay y Google Pay. También aceptamos pagos a través de nuestra aplicación
        móvil. 15.

*/

const $title: TextStyle = { fontFamily: typography.fonts.poppins.semiBold };
const $content: TextStyle = { fontFamily: typography.fonts.poppins.light };
