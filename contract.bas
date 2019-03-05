/*

	`Boundless Galaxy` @plrspro
	
	General notes:
	none

*/

/*

	Technical notes:
	1. The UInt64 value type represents unsigned integers with values ranging from 0 to 18,446,744,073,709,551,615. 
	2. Galaxy limitations obstructed for simplicity equalst to values ranging from 0 to 10 000 000 000 000 000 000
	3. 1 DERO = 1000000000000 value
*/

/* Service Functions and Utility */

Function Info(info_message String) Uint64 

	01 DIM txid as String
	02 LET txid = TXID()

	10  PRINTF "  +-------------------+  " 
	20  PRINTF "  |  `DERO  Galaxy    |  " 
	30  PRINTF "  |                   |  " 
	40  PRINTF "  | %s" info_message
	50  PRINTF "  |                   |  " 
	60  PRINTF "  +-------------------+  " 
	70  PRINTF "  + TXID: %s" txid
	80  PRINTF "  +-------------------+  " 
	
	999 RETURN 0
End Function 


Function Error(error_message String) Uint64 

	01 DIM txid as String
	02 LET txid = TXID()

	10  PRINTF "  +-----[ ERROR ]-----+  " 
	20  PRINTF "  |  `DERO  Galaxy    |  " 
	30  PRINTF "  |                   |  " 
	40  PRINTF "  | %s" error_message
	50  PRINTF "  |                   |  " 
	60  PRINTF "  +-----[ ERROR ]-----+  " 
	70  PRINTF "  + TXID: %s" txid
	80  PRINTF "  +-------------------+  " 
	
	999 RETURN 1
End Function 


Function Initialize() Uint64
	
	// Galaxy center is
	
	10 STORE("admin", SIGNER())   // store in DB  ["owner"] = address
	
	11 STORE("stats_planet_counter", 0)
	
	12 STORE("colonize_fee", 1 * 1000000000000); //1 DERO
	
	13 STORE("moto_fee", 1 * 1000000000000); //1 DERO
	
	14 STORE("galaxy_center", (10000000000000000000/2) + ":" + (10000000000000000000/2))
	15 STORE("galaxy_emperor_fee", 1 * 1000000000000) //1 DERO
	16 STORE("galaxy_emperor_reset_height", 0)
	17 STORE("galaxy_emperor_user", "")
	
	20 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 0)
	21 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 1)
	22 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 2)
	23 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 3)
	24 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 4)
	25 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 5)
	26 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 6)
	
	999 RETURN Info("Contract Successfully Deployed")
End Function 


/* Owner & Administrative Functions */

Function AdminTransferOwnership(new_admin String) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("swap", new_admin)
	21  RETURN 0
	
End Function
	
	
// until the new owner claims ownership, existing owner remains owner
Function AdminClaimOwnership() Uint64 

	10  IF ADDRESS_RAW(LOAD("swap")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("admin", SIGNER()) // ownership claim successful
	21  RETURN 0
	
End Function
	
	
// if signer is owner, withdraw any requested funds
// if everthing is okay, thety will be showing in signers wallet
Function AdminWithdraw(amount Uint64) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  SEND_DERO_TO_ADDRESS(SIGNER(), amount)
	21  RETURN 0
	
End Function


/* Contract Core Functions */

Function GalaxyEmperorReset() Uint64 

	//If current block higher then offset relese current galaxy emperor and reset back to 0:0

	999  RETURN 0
End Function


Function GalaxyEmperorOverbid() Uint64 


	999  RETURN 0
End Function


Function SectorSetMoto() Uint64 


	999  RETURN 0
End Function


Function UserSetAlias(new_name String) Uint64 

	
	999  RETURN 0
End Function


Function PlanetAcquire(position_x Uint64, position_y Uint64, position_z Uint64) Uint64

	// >= 0 && <= 10000000000000000000 (positions of x, y)
	// 00 01 02 03 04 05 06 07 [08] 09 10 11 12 13 14 15 16 (positions of z)
	
	// Initialize user stack if its his 1st platform
	10 DIM user as String
	11 DIM stack_index as Uint64
	12 LET user = SIGNER()
	13 LET stack_index = 0
	
	20 IF EXISTS(user+"_index") == 1 THEN GOTO 30
	21 STORE(user+"_index", stack_index)
	
	30 LET stack_index = LOAD(user+"_index")
	
	/*
    setoff.RARECloudiness = 1; // 0-100
    setoff.RARECold = 1; // 0-100
    setoff.RAREOcean = 1; // 0-100
    setoff.RARETemperate = 1; // 0-100
    setoff.RAREWarm = 1; // 0-100
    setoff.RAREHot = 1; // 0-100
    setoff.RARESpeckle = 1; // 0-100
    setoff.RAREClouds = 1; // 0-100
    setoff.RARELightColor = 1; // 0-100

    setoff.vWaterLevel = 0; // 0-40
    setoff.vRivers = 0; // 0-100
    setoff.vTemperature = 0; // 0-40
    setoff.vCloudiness = 0; // 0-20

    setoff.vCold_r = 44; // 0-100
    setoff.vCold_g = 13; // 0-100
    setoff.vCold_b = 14; // 0-100

    setoff.vOcean_r = 17; // 0-100
    setoff.vOcean_g = 18; // 0-100
    setoff.vOcean_b = 19; // 0-100

    setoff.vTemperate_r = 60; // 0-100
    setoff.vTemperate_g = 70; // 0-100
    setoff.vTemperate_b = 10; // 0-100

    setoff.vWarm_r = 60; // 0-100
    setoff.vWarm_g = 60; // 0-100
    setoff.vWarm_b = 60; // 0-100

    setoff.vHot_r = 60; // 0-100
    setoff.vHot_g = 60; // 0-100
    setoff.vHot_b = 60; // 0-100

    setoff.vSpeckle_r = 60; // 0-100
    setoff.vSpeckle_g = 60; // 0-100
    setoff.vSpeckle_b = 60; // 0-100

    setoff.vClouds_r = 60; // 0-100
    setoff.vClouds_g = 60; // 0-100
    setoff.vClouds_b = 60; // 0-100

    setoff.vLightColor_r = 60; // 0-100
    setoff.vLightColor_g = 60; // 0-100
    setoff.vLightColor_b = 60; // 0-100

    setoff.vHaze_r = 60; // 0-100
    setoff.vHaze_g = 60; // 0-100
    setoff.vHaze_b = 60; // 0-100

    setoff.fixtures01 = 10; // 0-20
    setoff.fixtures02 = 30; // 0-100
    setoff.fixtures03 = 50; // 0-100
    setoff.fixtures04 = 0; // 0-10
    setoff.fixtures05 = 0; // 0-7
    setoff.fixtures06 = 110; // 0-220
    setoff.fixtures07 = 40; // 0-80
    setoff.fixtures08 = 5; // 0-9
    setoff.fixtures09 = 7; // 0-20

    setoff.vAngle = 0; // 0-60
    setoff.vRotspeed = 0; // 0-20
	*/
	
	40 DIM planet_position as String
	41 LET planet_position = position_x+":"+position_y+":"+position_z
	
	// Check if slot is free
	42 IF EXISTS(planet_position + "/Owner") == 0 THEN GOTO 50
	43 RETURN 1
	
	// All checkup passed now we can generate planet
	
	50 PRINTF "Start Generation"
	
	94  STORE(planet_position + "/Mass", 			100 + RANDOM(1000))
	95  STORE(planet_position + "/Population", 		1000000 + RANDOM(10000000000))
	96  STORE(planet_position + "/AvgTemp", 		RANDOM(200))
	
	97  STORE(planet_position + "/OnSale", 			0)
	98  STORE(planet_position + "/Name", 			"")
	99  STORE(planet_position + "/Moto", 			"")
	100 STORE(planet_position + "/Owner", 			user)
	
	101 STORE(planet_position + "/RARECloudiness",  0 + RANDOM(100 + 1) )
	102 STORE(planet_position + "/RARECold", 		0 + RANDOM(100 + 1) )
	103 STORE(planet_position + "/RAREOcean", 		0 + RANDOM(100 + 1) )
	104 STORE(planet_position + "/RARETemperate", 	0 + RANDOM(100 + 1) )
	105 STORE(planet_position + "/RAREWarm", 		0 + RANDOM(100 + 1) )
	106 STORE(planet_position + "/RAREHot", 		0 + RANDOM(100 + 1) )
	107 STORE(planet_position + "/RARESpeckle", 	0 + RANDOM(100 + 1) )
	108 STORE(planet_position + "/RAREClouds", 		0 + RANDOM(100 + 1) )
	109 STORE(planet_position + "/RARELightColor", 	0 + RANDOM(100 + 1) )
	
	110 STORE(planet_position + "/vWaterLevel", 	0 + RANDOM( 40 + 1) )
	111 STORE(planet_position + "/vRivers", 		0 + RANDOM(100 + 1) )
	112 STORE(planet_position + "/vTemperature", 	0 + RANDOM( 40 + 1) )
	113 STORE(planet_position + "/vCloudiness", 	0 + RANDOM( 20 + 1) )
	
	114 STORE(planet_position + "/vCold_r", 		0 + RANDOM(100 + 1) )
	115 STORE(planet_position + "/vCold_g", 		0 + RANDOM(100 + 1) )
	116 STORE(planet_position + "/vCold_b", 		0 + RANDOM(100 + 1) )
	
	117 STORE(planet_position + "/vOcean_r", 		0 + RANDOM(100 + 1) )
	118 STORE(planet_position + "/vOcean_g", 		0 + RANDOM(100 + 1) )
	119 STORE(planet_position + "/vOcean_b", 		0 + RANDOM(100 + 1) )
	
	120 STORE(planet_position + "/vTemperate_r", 	0 + RANDOM(100 + 1) )
	121 STORE(planet_position + "/vTemperate_g", 	0 + RANDOM(100 + 1) )
	122 STORE(planet_position + "/vTemperate_b", 	0 + RANDOM(100 + 1) )
	
	123 STORE(planet_position + "/vWarm_r", 		0 + RANDOM(100 + 1) )
	124 STORE(planet_position + "/vWarm_g", 		0 + RANDOM(100 + 1) )
	125 STORE(planet_position + "/vWarm_b", 		0 + RANDOM(100 + 1) )
	
	126 STORE(planet_position + "/vHot_r", 			0 + RANDOM(100 + 1) )
	127 STORE(planet_position + "/vHot_g", 			0 + RANDOM(100 + 1) )
	128 STORE(planet_position + "/vHot_b", 			0 + RANDOM(100 + 1) )
	
	129 STORE(planet_position + "/vSpeckle_r", 		0 + RANDOM(100 + 1) )
	130 STORE(planet_position + "/vSpeckle_g", 		0 + RANDOM(100 + 1) )
	131 STORE(planet_position + "/vSpeckle_b", 		0 + RANDOM(100 + 1) )
		
	132 STORE(planet_position + "/vClouds_r", 		0 + RANDOM(100 + 1) )
	133 STORE(planet_position + "/vClouds_g", 		0 + RANDOM(100 + 1) )
	134 STORE(planet_position + "/vClouds_b", 		0 + RANDOM(100 + 1) )
	
	135 STORE(planet_position + "/vLightColor_r", 	0 + RANDOM(100 + 1) )
	136 STORE(planet_position + "/vLightColor_g", 	0 + RANDOM(100 + 1) )
	137 STORE(planet_position + "/vLightColor_b", 	0 + RANDOM(100 + 1) )
	
	138 STORE(planet_position + "/vHaze_r", 		0 + RANDOM(100 + 1) )
	139 STORE(planet_position + "/vHaze_g", 		0 + RANDOM(100 + 1) )
	140 STORE(planet_position + "/vHaze_b", 		0 + RANDOM(100 + 1) )
	
	141 STORE(planet_position + "/fixtures01",  	0 + RANDOM( 20 + 1) )
	142 STORE(planet_position + "/fixtures02", 		0 + RANDOM(100 + 1) )
	143 STORE(planet_position + "/fixtures03", 		0 + RANDOM(100 + 1) )
	144 STORE(planet_position + "/fixtures04", 		0 + RANDOM( 10 + 1) )
	145 STORE(planet_position + "/fixtures05", 		0 + RANDOM(  7 + 1) )
	146 STORE(planet_position + "/fixtures06", 		0 + RANDOM(220 + 1) )
	147 STORE(planet_position + "/fixtures07", 		0 + RANDOM( 80 + 1) )
	148 STORE(planet_position + "/fixtures08", 		0 + RANDOM(  9 + 1) )
	149 STORE(planet_position + "/fixtures09", 		0 + RANDOM( 20 + 1) )
	
	150 STORE(planet_position + "/vAngle", 			0 + RANDOM( 60 + 1) )
	151 STORE(planet_position + "/vRotspeed", 		0 + RANDOM( 20 + 1) )
	
	200 STORE(user+"_index_"+stack_index, planet_position)
	201 STORE(user+"_index", stack_index + 1)
	
	202 STORE("stats_planet_counter", LOAD("stats_planet_counter") + 1)
	
	300 RETURN 0
	
End Function

/*
Function PlanetMerge(planet1_x Uint64, planet1_y Uint64, planet1_z Uint64, planet2_x Uint64, planet2_y Uint64, planet2_z Uint64)

End Function


Function PlanetSetNote(position_x Uint64, position_y Uint64, position_z Uint64, note String) Uint64

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"] - Owner") == 1 THEN GOTO 20
	
	
	11 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"] - Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO
	
	
	100 STORE("["+position_x+":"+position_y+":"+position_z+"] - Note", note)

End Function


Function PlanetSellOut()

End Function


Function PlanetBuyIn()

End Function
*/
