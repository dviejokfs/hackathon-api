import { FetchTokenClassesDto, GetMyProfileDto, RegisterUserDto } from '@gala-chain/api'
import { ChainUser, gcclient, publicKeyContractAPI } from '@gala-chain/client'
import { strings, type Strings } from '@helia/strings'
import { FsBlockstore } from 'blockstore-fs'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import { createHelia, type Helia } from 'helia'
import { CID } from 'multiformats/cid'
import path from 'path'

import * as dto from './apples/dtos'

const newUser = ChainUser.withRandomKeys()
console.log('New user: ', newUser)

const app = express()
const networkRoot = () => '/Users/davidviejo/projects/gala/hackathon/decentralized-ed/test-network'
const params = {
	orgMsp: 'CuratorOrg',
	userId: 'admin',
	userSecret: 'adminpw',
	connectionProfilePath: path.resolve(networkRoot(), 'connection-profiles/cpp-curator.json'),
}

const appleContract = {
	channelName: 'product-channel',
	chaincodeName: 'basic-product2',
	contractName: 'AppleContract',
}

const pubKeyContract = {
	channelName: 'product-channel',
	chaincodeName: 'basic-product2',
	contractName: 'PublicKeyContract',
}
const tokenContract = {
	channelName: 'product-channel',
	chaincodeName: 'basic-product2',
	contractName: 'GalaChainToken',
}

let adminPrivateKeyString: string | undefined
function getAdminPrivateKey() {
	if (adminPrivateKeyString === undefined) {
		adminPrivateKeyString = fs.readFileSync(path.resolve(networkRoot(), 'dev-admin-key/dev-admin.priv.hex.txt')).toString()
	}

	return adminPrivateKeyString
}

// interface AppleContractAPI {
//   CreateCourse(dto: CreateCourseDto): Promise<GalaChainResponse<void>>;
//   FetchCourses(dto: FetchCoursesDto): Promise<GalaChainResponse<PagedCoursesDto>>;
// }

// function appleContractAPI(client: ChainClient): AppleContractAPI {
//   return {
//     FetchCourses(dto: FetchCoursesDto) {
//       return client.evaluateTransaction("FetchCourses", dto, PagedCoursesDto);
//     },
//     CreateCourse(dto: CreateCourseDto) {
//       return client.submitTransaction("CreateCourse", dto) as Promise<GalaChainResponse<void>>;
//     }
//   };
// }

const pubKeyClient = gcclient.forConnectionProfile(params).forContract(pubKeyContract).extendAPI(publicKeyContractAPI)

const tokenClient = gcclient.forConnectionProfile(params).forContract(tokenContract)

const courseClient = gcclient.forConnectionProfile(params).forContract(appleContract)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/ping', async (req, res) => {
	try {
		const newUser = ChainUser.withRandomKeys()

		const dto = new RegisterUserDto()
		dto.publicKey = newUser.publicKey
		dto.sign(getAdminPrivateKey(), false)

		// When
		const chaincodeRes = await pubKeyClient.RegisterEthUser(dto)

		res.send(chaincodeRes)
	} catch (e) {
		console.error(e)
		res.send('Error')
	}
})
const sendValidationError = (res: express.Response, message: string) => {
	res.status(400).send({ message })
}
const dtoMap = {
	GetMyProfileDto: GetMyProfileDto,
	AppleTreeDto: dto.AppleTreeDto,
	AppleTreesDto: dto.AppleTreesDto,
	CreateCourseDto: dto.CreateCourseDto,
	FetchCreatedCoursesDto: dto.FetchCreatedCoursesDto,
	FetchEnrolledCoursesDto: dto.FetchEnrolledCoursesDto,
	AddBalanceToStudentDto: dto.AddBalanceToStudentDto,
	FetchPurchasedCoursesDto: dto.FetchPurchasedCoursesDto,
	PickAppleDto: dto.PickAppleDto,
	FetchCoursesDto: dto.FetchCoursesDto,
	FetchBalanceOfStudentDto: dto.FetchBalanceOfStudentDto,
	PagedCoursesDto: dto.PagedCoursesDto,
	StudentPurchaseWithCourseDto: dto.StudentPurchaseWithCourseDto,
	PagedStudentPurchaseDto: dto.PagedStudentPurchaseDto,
	StudentBalanceDto: dto.StudentBalanceDto,
	FetchTreesDto: dto.FetchTreesDto,
	PagedTreesDto: dto.PagedTreesDto,
	EnrollInCourseDto: dto.EnrollInCourseDto,
	FetchMyCourseDto: dto.FetchMyCourseDto,
	FetchCourseDto: dto.FetchCourseDto,
	UpdateCourseDto: dto.UpdateCourseDto,
	UpdateLessonDto: dto.UpdateLessonDto,
	UpdateChapterDto: dto.UpdateChapterDto,
	CreateChapterDto: dto.CreateChapterDto,
	CreateLessonDto: dto.CreateLessonDto,
	FetchLessonDto: dto.FetchLessonDto,
	CreateNFTForLessonDto: dto.CreateNFTForLessonDto,
	FetchTokenClassesDto: FetchTokenClassesDto,
	CompleteLessonDto: dto.CompleteLessonDto,
	GetStudentNFTsDto: dto.GetStudentNFTsDto,
}
const blockStore = new FsBlockstore('./ipfs-data')
let helia: Helia
let s: Strings
createHelia({
	blockstore: blockStore,
}).then((h) => {
	helia = h
	s = strings(h)
	// helia.start().catch(console.error)
})
app.get('/ipfs/get/:cid', async (req, res) => {
	const { cid } = req.params
	console.log('GET /ipfs/get/:cid', cid)
	if (!cid) {
		sendValidationError(res, 'cid is required')
		return
	}
	if (!helia) {
		sendValidationError(res, 'Helia not initialized')
		return
	}
	try {
		const cidParsed = CID.parse(cid)
		const myString = await s.get(cidParsed)
		res.send(myString)
	} catch (e) {
		console.error(e)
		res.status(500).send({
			message: e.toString(),
		})
	}
})
app.post('/ipfs/add', async (req, res) => {
	try {
		if (!helia) {
			sendValidationError(res, 'Helia not initialized')
			return
		}
		const { data } = req.body
		if (!data) {
			sendValidationError(res, 'data is required')
			return
		}
		const myImmutableAddress = await s.add(data)
		await s.get(myImmutableAddress)
		console.log('myImmutableAddress', myImmutableAddress.toString())
		res.send({
			cid: myImmutableAddress.toString(),
		})
	} catch (e) {
		console.error(e)
		res.status(500).send({
			message: e.toString(),
		})
	}
})

app.post('/submit', async (req, res) => {
	try {
		const { data, fcn, contract } = req.body
		if (!data) {
			sendValidationError(res, 'data is required')
			return
		}
		if (!fcn) {
			sendValidationError(res, 'fcn is required')
			return
		}
		if (!contract) {
			sendValidationError(res, 'contract is required')
			return
		}
		const client = contract === 'course' ? courseClient : contract === 'token' ? tokenClient : pubKeyClient
		const dto = dtoMap[`${fcn}Dto`] ?? dtoMap[req.body['class']]
		console.log('class', req.body['class'])
		if (!dto) {
			sendValidationError(res, 'Invalid fcn')
			return
		}
		// When
		const chaincodeRes = await client.submitTransaction(fcn, dto.deserialize(dto, data))

		res.send(chaincodeRes)
	} catch (e) {
		console.error(e)
		res.status(500).send({
			message: 'Error occurred',
		})
	}
})
app.post('/credential-offer', async (req, res) => {
	try {
		const data = {
			grants: {
				'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
					'pre-authorized_code': '1234',
					user_pin_required: true,
				},
			},
			credentialsToIssue: [
				{
					type: 'CourseCompletion',
					data: req.body,
				},
			],
		}
		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		}

		const response = await fetch('http://localhost:3100/credential-offers', options)
		const responseData = await response.json()
		res.send(responseData)
	} catch (e) {
		console.error(e)
		res.status(500).send({
			message: 'Error occurred',
		})
	}
})
app.post('/evaluate', async (req, res) => {
	try {
		const { data, fcn, contract } = req.body
		if (!data) {
			sendValidationError(res, 'data is required')
			return
		}
		if (!fcn) {
			sendValidationError(res, 'fcn is required')
			return
		}
		if (!contract) {
			sendValidationError(res, 'contract is required')
			return
		}
		const client = contract === 'course' ? courseClient : contract === 'token' ? tokenClient : pubKeyClient
		const dto = dtoMap[`${fcn}Dto`] ?? dtoMap[req.body['class']]
		console.log('class', req.body['class'])
		if (!dto) {
			sendValidationError(res, 'Invalid fcn')
			return
		}
		// When
		const chaincodeRes = await client.evaluateTransaction(fcn, dto.deserialize(dto, data))

		res.send(chaincodeRes)
	} catch (e) {
		console.error(e)
		res.status(500).send({
			message: 'Error occurred',
		})
	}
})
app.post('/init', async (req, res) => {
	try {
		await pubKeyContract
	} catch (e) {
		console.error(e)
		res.send('Error')
	}
})
app.post('/register', async (req, res) => {
	try {
		const { publicKey } = req.body
		if (!publicKey) {
			sendValidationError(res, 'publicKey is required')
			return
		}
		const dto = new RegisterUserDto()
		dto.publicKey = publicKey
		dto.sign(getAdminPrivateKey(), false)

		// When
		const chaincodeRes = await pubKeyClient.RegisterEthUser(dto)

		res.send(chaincodeRes)
	} catch (e) {
		console.error(e)
		res.send('Error')
	}
})

// app.get("/createcoursetest", async (req, res) => {
//   try {
//     const newUser = ChainUser.withRandomKeys();
//     const registerUserDto = new RegisterUserDto();
//     registerUserDto.publicKey = newUser.publicKey;
//     registerUserDto.sign(getAdminPrivateKey(), false);

//     await pubKeyClient.RegisterEthUser(registerUserDto);
//     const courseId = v4();
//     const dto = new CreateCourseDto(courseId);
//     dto.sign(newUser.privateKey, false);

//     // When
//     const chaincodeRes = await courseClient.CreateCourse(dto);

//     res.send(chaincodeRes);
//   } catch (e) {
//     console.error(e);
//     res.send("Error");
//   }
// });
// app.get("/courses", async (req, res) => {
//   try {
//     const newUser = ChainUser.withRandomKeys();
//     const registerUserDto = new RegisterUserDto();
//     registerUserDto.publicKey = newUser.publicKey;
//     registerUserDto.sign(getAdminPrivateKey(), false);
//     await pubKeyClient.RegisterEthUser(registerUserDto);
//     const courseId = v4();
//     const dto = new FetchCoursesDto(courseId);
//     dto.sign(newUser.privateKey, false);

//     // When

//     const chaincodeRes = await courseClient.FetchCourses(dto);

//     res.send(chaincodeRes);
//   } catch (e) {
//     console.error(e);
//     res.send("Error");
//   }
// });
app.listen(3020, () => {
	console.log('Server running on port 3020')
})
