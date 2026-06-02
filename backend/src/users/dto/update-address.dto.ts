import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MaxLength, ValidateIf } from "class-validator";

export class UpdateAddressDto {
  @ApiProperty({ example: "SA" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  country!: string;

  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^\+?[0-9\s-]{8,30}$/, {
    message: "phoneNumber must be a valid mobile number",
  })
  phoneNumber!: string;

  @ApiProperty({ example: "منطقة الرياض" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  region!: string;

  @ApiProperty({ example: "الرياض" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @ApiProperty({ example: "العارض" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  district!: string;

  @ApiProperty({ example: "شارع الملك سلمان" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  street!: string;

  @ApiProperty({ example: "12" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  buildingNumber!: string;

  @ApiProperty({ example: "13332" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiPropertyOptional({ example: "RDBA1234", description: "Required when country is SA." })
  @ValidateIf((address: UpdateAddressDto) => address.country === "SA")
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  nationalAddress?: string;
}
