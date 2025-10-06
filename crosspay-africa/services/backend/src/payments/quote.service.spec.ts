import { Test, TestingModule } from "@nestjs/testing";
import { QuoteService } from "./quote.service";
import { QuoteRequestDto } from "./dto/quote.dto";

describe("QuoteService", () => {
  let service: QuoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteService],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("calculateQuote", () => {
    it("should calculate quote correctly for Ghana to Nigeria transfer", () => {
      const quoteRequest: QuoteRequestDto = {
        recipientPhone: "+2348000000000",
        amount: 100,
        sourceCurrency: "GHS",
      };

      const result = service.calculateQuote(quoteRequest);

      expect(result).toBeDefined();
      expect(result.sourceCountry).toBe("GH");
      expect(result.targetCountry).toBe("NG");
      expect(result.sourceCurrency).toBe("GHS");
      expect(result.targetCurrency).toBe("NGN");
      expect(result.availableRails.length).toBeGreaterThan(0);
      expect(result.exchangeRate).toBeGreaterThan(0);
      expect(result.fees).toBeDefined();
      expect(result.fees.total).toBeGreaterThan(0);
    });

    it("should calculate quote correctly for Kenya to Uganda transfer", () => {
      const quoteRequest: QuoteRequestDto = {
        recipientPhone: "+256700000000",
        amount: 1000,
        sourceCurrency: "KES",
      };

      const result = service.calculateQuote(quoteRequest);

      expect(result).toBeDefined();
      expect(result.sourceCountry).toBe("KE");
      expect(result.targetCountry).toBe("UG");
      expect(result.sourceCurrency).toBe("KES");
      expect(result.targetCurrency).toBe("UGX");
      expect(result.availableRails.length).toBeGreaterThan(0);
      expect(result.exchangeRate).toBeGreaterThan(0);
      expect(result.fees).toBeDefined();
      expect(result.fees.total).toBeGreaterThan(0);
    });

    it("should throw error for unsupported country", () => {
      const quoteRequest: QuoteRequestDto = {
        recipientPhone: "+2348000000000",
        amount: 100,
        sourceCurrency: "EUR", // France
      };

      expect(() => service.calculateQuote(quoteRequest)).toThrow(
        "Pays source non pris en charge"
      );
    });
  });

  describe("detectCountryFromPhone", () => {
    it("should detect Ghana from phone number", () => {
      expect(service.detectCountryFromPhone("+233500000000")).toBe("GH");
    });

    it("should detect Nigeria from phone number", () => {
      expect(service.detectCountryFromPhone("+2348000000000")).toBe("NG");
    });

    it("should detect Kenya from phone number", () => {
      expect(service.detectCountryFromPhone("+254700000000")).toBe("KE");
    });

    it("should throw error for unsupported country code", () => {
      expect(() => service.detectCountryFromPhone("+33600000000")).toThrow(
        "Pays non pris en charge"
      );
    });
  });

  describe("calculateExchangeRate", () => {
    it("should return exchange rate for GHS to NGN", () => {
      const rate = service.calculateExchangeRate("GHS", "NGN");
      expect(rate).toBeGreaterThan(0);
    });

    it("should return exchange rate for KES to UGX", () => {
      const rate = service.calculateExchangeRate("KES", "UGX");
      expect(rate).toBeGreaterThan(0);
    });
  });

  describe("calculateFees", () => {
    it("should calculate fees correctly for small amount", () => {
      const fees = service.calculateFees(100, "MFS");
      expect(fees.total).toBeGreaterThan(0);
      expect(fees.breakdown.percentFee).toBeGreaterThan(0);
      expect(fees.breakdown.fixedFee).toBeGreaterThan(0);
      expect(fees.breakdown.aggregatorFee).toBeGreaterThan(0);
    });

    it("should calculate fees correctly for large amount", () => {
      const fees = service.calculateFees(1000, "Flutterwave");
      expect(fees.total).toBeGreaterThan(0);
      expect(fees.breakdown.percentFee).toBeGreaterThan(0);
      expect(fees.breakdown.fixedFee).toBeGreaterThan(0);
      expect(fees.breakdown.aggregatorFee).toBeGreaterThan(0);
    });
  });
});
