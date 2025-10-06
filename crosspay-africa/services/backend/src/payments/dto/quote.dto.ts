import { IsNotEmpty, IsString, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class QuoteRequestDto {
  @ApiProperty({
    description: "Numéro de téléphone du destinataire (format international)",
    example: "+254712345678",
  })
  @IsNotEmpty()
  @IsString()
  recipientPhone: string;

  @ApiProperty({
    description: "Montant à envoyer (dans la devise de l'expéditeur)",
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: "Code ISO de la devise d'envoi",
    example: "XOF",
  })
  @IsNotEmpty()
  @IsString()
  sourceCurrency: string;
}

export class QuoteResponseDto {
  @ApiProperty({
    description: "Identifiant unique du devis",
    example: "quote-123456",
  })
  quoteId: string;

  @ApiProperty({
    description: "Pays du destinataire",
    example: "Kenya",
  })
  recipientCountry: string;

  @ApiProperty({
    description: "Code ISO de la devise du destinataire",
    example: "KES",
  })
  destinationCurrency: string;

  @ApiProperty({
    description: "Montant d'envoi (dans la devise de l'expéditeur)",
    example: 100,
  })
  sourceAmount: number;

  @ApiProperty({
    description: "Montant que le destinataire recevra (dans sa devise locale)",
    example: 6500,
  })
  destinationAmount: number;

  @ApiProperty({
    description: "Taux de change appliqué",
    example: 65,
  })
  exchangeRate: number;

  @ApiProperty({
    description: "Frais totaux (dans la devise de l'expéditeur)",
    example: 5,
  })
  totalFees: number;

  @ApiProperty({
    description: "Détail des frais",
    example: {
      fixedFee: 2,
      percentageFee: 2,
      aggregatorFee: 1,
    },
  })
  feeBreakdown: {
    fixedFee: number;
    percentageFee: number;
    aggregatorFee: number;
  };

  @ApiProperty({
    description: "Rails de paiement disponibles",
    example: [
      {
        id: "mfs-africa",
        name: "MFS Africa",
        estimatedDelivery: "1-2 minutes",
        fee: 3,
      },
      {
        id: "flutterwave",
        name: "Flutterwave",
        estimatedDelivery: "5-10 minutes",
        fee: 2.5,
      },
    ],
  })
  availableRails: Array<{
    id: string;
    name: string;
    estimatedDelivery: string;
    fee: number;
  }>;

  @ApiProperty({
    description: "Durée de validité du devis en secondes",
    example: 300,
  })
  expiresIn: number;
}
