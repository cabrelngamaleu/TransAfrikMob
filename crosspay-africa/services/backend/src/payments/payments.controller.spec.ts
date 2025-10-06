import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { QuoteService } from "./quote.service";
import { QuoteRequestDto, QuoteResponseDto } from "./dto/quote.dto";

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let quoteService: QuoteService;
  let paymentsService: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: QuoteService,
          useValue: {
            calculateQuote: jest.fn(),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            getAvailableProviders: jest.fn(),
            initiatePayment: jest.fn(),
            verifyPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    quoteService = module.get<QuoteService>(QuoteService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getQuote", () => {
    it("should return a quote response", async () => {
      const quoteRequest: QuoteRequestDto = {
        recipientPhone: "+2348000000000",
        amount: 100,
        sourceCurrency: "GHS",
      };

      const quoteResponse = {
        sourceCountry: "GH",
        targetCountry: "NG",
        sourceCurrency: "GHS",
        targetCurrency: "NGN",
        amount: 100,
        convertedAmount: 5500,
        exchangeRate: 55,
        fees: {
          total: 10,
          transfer: 2,
          conversion: 3,
          breakdown: {
            percentFee: 5,
            fixedFee: 2,
            aggregatorFee: 3,
          },
        },
        availableRails: ["MFS Africa", "Flutterwave"],
        estimatedDeliveryTime: "1-2 jours ouvrables",
      };

      jest.spyOn(quoteService, "calculateQuote").mockReturnValue(quoteResponse);

      expect(await controller.getQuote(quoteRequest)).toBe(quoteResponse);
      expect(quoteService.calculateQuote).toHaveBeenCalledWith(quoteRequest);
    });
  });
});
