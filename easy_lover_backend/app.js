require("dotenv").config();
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const port = process.env.PORT || 4000;
const helmet = require("helmet");
const { Survey, User, Response, Interaction } = require("./models");
const { Op } = require("sequelize");
const models = require("./models/index");
models.sequelize.sync();

// Middleware
app.use(helmet());
app.use(require("./middlewares/BodyParser"));

// User Routes
app.post("/user", async (req, res, next) => {
  const { userFields } = req.body;
  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: {
              [Op.iLike]: userFields.email
            }
          },
          {
            phoneNumber: {
              [Op.iLike]: userFields.phoneNumber
            }
          }
        ]
      }
    });
    console.log("Existing User~~~", existingUser);
    if (existingUser) {
      return res.sendStatus(206).json({
        error: "A user with that phone number or email already exists."
      });
    }
    const user = await User.create(userFields);
    console.log("Created User~~~", user);
    res.sendStatus(200).json(user);
  } catch (e) {
    console;
    return res.status(206).json({ error: e.message });
  }
});
app.put("/user/:id", async (req, res, next) => {
  if (!req.params.id) {
    res.status(206).json({ error: "User Id required in PUT request." });
  }
  try {
    const { userFields } = req.body;
    let updatedUser = await User.update(userFields, {
      where: { id: req.params.id }
      //Add an include here, reduce to one call
    });
    console.log("Updated User", updatedUser[0]);
    const userData = await User.findOne({
      where: { id: req.params.id },
      include: [{ model: Response, as: "Responses" }]
    });
    console.log("Updated User Data~ ", userData);
    res.sendStatus(200).send(userData);
  } catch (e) {
    console;
    return res.status(200).send({ error: e.message });
  }
});

// Returns user data and response
app.get("/user/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "You must include a User Id" });
    }
    const userData = await User.findOne({
      where: { id },
      include: [
        {
          model: Response,
          as: "Responses",
          // attributes: [],
          where: {
            userId: id
          }
        }
      ]
    });
    console.log("User Data", userData.dataValues.Responses);
    res.sendStatus(200).json(userData);
  } catch (err) {
    return res.status(206).json({ error: err.message });
  }
});

app.post("/survey", async (req, res, next) => {
  const { surveyFields } = req.body;
  try {
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const survey = await Survey.create({ idNumber, ...surveyFields });
    console.log("Created survey~", survey);
    return res.sendStatus(200).json(survey);
  } catch (e) {
    console.error("Error creating survey", e);
    //handle error
  }
});

app.get("/survey/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    let foundSurvey = await Survey.findOne({
      where: {
        id
      }
    });
    if (!foundSurvey) {
      return res
        .sendStatus(206)
        .json({ error: `Survey with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundSurvey);
  } catch (e) {
    console.error("Error creating response", e);
  }
});

app.post("/response", async (req, res, next) => {
  const { responseFields } = req.body;
  try {
    const existingResponse = await Response.findOne({
      where: {
        surveyId: responseFields.surveyId,
        userId: responseFields.userId
      }
    });
    if (existingResponse) {
      console.log(
        "User has already submitted a response for this survey",
        existingResponse
      );
      res.sendStatus(206).json(existingResponse);
    }
    const response = await Response.create(responseFields);
    console.log("Created Response~~", response);
    res.sendStatus(200).json(response);
  } catch (e) {
    console.error("Error creating response~~", e);
    //handle error
  }
});

app.get("/response/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let foundResponse = await Response.findOne({
      where: {
        id
      }
    });
    console.log("Found Response~~", foundResponse);
    if (!foundResponse) {
      return res
        .sendStatus(206)
        .json({ error: `Response with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundResponse);
  } catch (e) {
    console.error("Error creating response", e);
  }
});

// Compare the two user's responses and return a score object + the follow up questionsJson
app.post("/compare", async (req, res, next) => {
  const {
    surveyId,
    fromUserId,
    toUserId,
    compatibilityScore, // Should this be on the frontend?
    question1,
    question2,
    question3,
    question4
  } = req.params;
  try {
    const fromUserResponse = await Response.findOne({
      where: {
        surveyId,
        userId: fromUserId
      }
    });
    console.log("fromUserResponse", fromUserResponse.dataValues);
    const toUserResponse = await Response.findOne({
      where: {
        surveyId,
        userId: toUserId
      }
    });
    console.log("toUserResponse", toUserResponse.dataValues);
    console.log(
      `User 1 Response ${fromUserResponse} \n User 2 Response ${toUserResponse}`
    );

    const interaction = await Interaction.create({
      surveyId,
      fromUserId,
      toUserId,
      compatibilityScore,
      question1,
      question2,
      question3,
      question4
    });

    res.sendStatus(200).json(interaction);
    // WS updates sent here
  } catch (e) {
    console.error(e);
  }
});
let x = {
  id: 460,
  userId: "8c8344a0-a6e7-11e9-8689-9f36c8bfea8b",
  amountUsd: "12645000",
  returnsUsd: "0",
  incomeUsd: "0",
  cashUsd: "200",
  createdAt: "2019-07-15T10:01:43.665Z",
  updatedAt: "2019-07-17T19:27:16.765Z",
  deletedAt: null,
  PortfolioHoldings: [
    {
      id: 87,
      portfolioId: 460,
      tokenId: 1010,
      amountTokens: "2810000000000000000000",
      amountUsd: "12645000",
      returnsUsd: "0",
      incomeUsd: "0",
      cashUsd: "0",
      createdAt: "2019-07-15T15:32:57.937Z",
      updatedAt: "2019-07-15T15:36:27.300Z",
      deletedAt: null,
      Token: {
        id: 1010,
        symbol: "TOBY",
        name: "TOBY",
        launchDate: "2019-07-15T00:00:00.000Z",
        type: "MER",
        assetId: "510eabd0-a6dd-11e9-8689-9f36c8bfea8b",
        decimalUnits: 18,
        investorCap: null,
        ownerWalletId: 31,
        contractId: 1036,
        totalSupply: "4500000000000000000000",
        status: "Active",
        isPaused: false,
        structure: "Equity",
        initialPriceUsd: "4500",
        marketCapUsd: "4500000",
        tokenPriceUsd: "4500",
        publicViewable: true,
        permissions: {},
        offeringAmount: "1000",
        offeringDescription: "Toby House Equity Offering",
        proxyOwnerWalletId: 31,
        proxyImplementationId: 1,
        presentationJson: {},
        createdAt: "2019-07-15T15:32:57.732Z",
        updatedAt: "2019-07-15T15:32:57.732Z",
        deletedAt: null,
        WalletHoldings: [
          {
            id: 92,
            walletId: 31,
            tokenId: 1010,
            amountTokens: "2810000000000000000000",
            amountUsd: "12645000",
            returnsUsd: "0",
            incomeUsd: "0",
            cashUsd: "0",
            createdAt: "2019-07-15T15:32:57.851Z",
            updatedAt: "2019-07-15T15:36:27.289Z",
            deletedAt: null,
            Wallet: {
              id: 31,
              userId: "8c8344a0-a6e7-11e9-8689-9f36c8bfea8b",
              type: "ETH",
              displayName: "Amy Johnson Wallet 1",
              displayDescriptio: null,
              addressHash: "0xcbaac343dffa7a5dad16f57b7d8625fb0eb0e8a4",
              amountWei: "0",
              amountUsd: "0",
              default: true,
              signingType: "metamask",
              lastBlock: 4737729,
              createdAt: "2019-07-15T13:00:35.614Z",
              updatedAt: "2019-07-15T13:03:00.361Z",
              deletedAt: null
            }
          }
        ],
        Asset: {
          id: "510eabd0-a6dd-11e9-8689-9f36c8bfea8b",
          title: "Toby House",
          slug: "toby-house",
          subtitle: null,
          sponsorName: null,
          sponsorDescription: null,
          assetTypeId: 30,
          publicViewable: true,
          permissions: null,
          presentationJson: {
            assetCard: {
              fields: [
                { label: "Equity Offered", content: "100%" },
                { label: "Seeking", content: "£4,500,000" },
                { label: "Location", content: "Bristol" },
                { label: "Category", content: "Commercial Office" },
                { label: "Valuation", content: "£4,500,000" },
                { label: "Share price", content: "£100" }
              ],
              description:
                "An apartment block comprising of 17 apartments, Toby House is a major residential development in the heart of Bristol.",
              headerImage: {
                url:
                  "https://whitelabel-pangea-backend-docs.s3.amazonaws.com/hmlr/toby_house.jpg",
                label: "Toby House"
              },
              primaryColor: "#c7bf98"
            },
            holdingRow: {
              fields: [
                { label: "Category", content: "Commercial Office" },
                { label: "Location", content: "Bristol" },
                { label: "Share Type", content: "Equity" }
              ],
              description:
                "An apartment block comprising of 17 apartments, Toby House is a major residential development in the heart of Bristol.",
              headerImage:
                "https://whitelabel-pangea-backend-docs.s3.amazonaws.com/hmlr/toby_house.jpg"
            },
            summaryCard: {
              title: "Toby House",
              fields: [
                { label: "Equity Offered", content: "100%" },
                { label: "Valuation", content: "£4,500,000" },
                { label: "Share price", content: "£100" },
                { label: "Seeking", content: "£4,500,000" }
              ],
              location: "Bristol",
              websiteUrl: "www.london-agency.com",
              description:
                "An apartment block comprising of 17 apartments, Toby House is a major residential development in the heart of Bristol.",
              primaryImage: {
                url:
                  "https://whitelabel-pangea-backend-docs.s3.amazonaws.com/hmlr/toby_house.jpg",
                label: "Property"
              },
              secondaryImage: {
                url:
                  "https://whitelabel-pangea-backend-docs.s3.amazonaws.com/hmlr/real_estate.jpg",
                label: "Listed By"
              }
            },
            assetDashboard: {
              data: [
                {
                  items: {
                    columns: [
                      {
                        rows: [
                          {
                            label: "Returns Distribution",
                            content:
                              "Shares of Toby House are non dividend-paying. However, shareholders will be entitled to a proportional share in the proceeds of an exit of the company if such proceeds."
                          },
                          {
                            columns: [
                              { label: "Offering Type", content: "Equity" },
                              { label: "Seeking", content: "£4,500,000" },
                              { label: "Available Shares", content: "250,000" }
                            ]
                          },
                          {
                            columns: [
                              { label: "Share Price", content: "£100" },
                              {
                                label: "Equity Offered",
                                style: { textAlign: "center" },
                                content: "100%"
                              },
                              {
                                label: "Lockup Period",
                                style: {
                                  textAlign: "right",
                                  marginBottom: "30px"
                                },
                                content: "6 Months"
                              }
                            ]
                          }
                        ],
                        columns: [
                          {
                            rows: [
                              {
                                label: "Trading Availability",
                                style: {
                                  marginBottom: "30px",
                                  paddingRight: "30px"
                                },
                                content:
                                  "Upon initial issuance, secondary trading of Sutton's Yard shares must undergo a six month lock-up period. To be whitelisted for secondary buying and selling activity, investors must undergo KYC and investor accreditation checks performed by ConsenSys Digital Securities. Buying and selling shares of Drake's Island Equity shares is a taxable event. ConsenSys Digital Securities does not act as custodian. Shares exchanged on ConsenSys Digital Securities leverage AirSwap's Atomic Swap Technology to execute non-custodial transfers between buyer and seller"
                              }
                            ]
                          },
                          {
                            columns: [
                              {
                                chart: {
                                  style: { height: "220px" },
                                  title: "Toby House Capital Stack",
                                  labels: ["Equity", "Debt"],
                                  symbol: "%",
                                  datasets: [
                                    {
                                      data: ["60, 40"],
                                      backgroundColor: [
                                        "#192B79",
                                        "#2B4BBF",
                                        "#277DE1",
                                        "#3CBFF6",
                                        "#19D8AA",
                                        "#1ABC9C",
                                        "#4A4A4A",
                                        "#8E8E8E",
                                        "#B6B6B6",
                                        "#E6E6E6"
                                      ]
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  title: "Investment Details"
                },
                {
                  items: {
                    columns: [
                      {
                        rows: [
                          {
                            label: "Property Description",
                            style: {
                              marginBottom: "30px",
                              paddingRight: "30px"
                            },
                            content:
                              "An apartment block comprising of 17 apartments, Toby House is a major residential development in the heart of Bristol."
                          },
                          {
                            columns: [
                              { label: "Title Id", content: "IJKL123" },
                              { label: "City", content: "Bristol" },
                              { label: "Street", content: "Digital Street" }
                            ]
                          },
                          {
                            columns: [
                              { label: "Zip Code", content: "EC1V 7EN" },
                              { label: "Zoning", content: "Mixed Use" },
                              {
                                label: "Features",
                                content:
                                  "Storage facilities, office space, courtyard."
                              }
                            ]
                          },
                          {
                            columns: [
                              { label: "Price Paid", content: "£20,000,000" },
                              {
                                label: "Date Purchased",
                                content: "11/03/2014"
                              },
                              { label: "Proprietor", content: "Bob White" }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  title: "Title Details"
                }
              ]
            }
          },
          createdAt: "2019-07-15T08:48:28.941Z",
          updatedAt: "2019-07-15T08:51:02.481Z",
          deletedAt: null,
          Images: [
            {
              id: 65,
              url:
                "https://img-pangea-backend.usa.us-east-1.whitelabel.meridio.co/1563180460292-toby_house.jpg",
              title: "toby_house.jpg",
              description: null,
              objectType: "Asset",
              objectTypeId: null,
              objectTypeUUID: "510eabd0-a6dd-11e9-8689-9f36c8bfea8b",
              primary: true,
              secondary: true,
              createdAt: "2019-07-15T08:48:28.993Z",
              updatedAt: "2019-07-15T08:51:02.488Z",
              deletedAt: null
            }
          ],
          AssetType: {
            id: 30,
            type: "Real Estate",
            name: "Real Estate",
            description: "Real Estate",
            subTypes: [],
            createdAt: "2019-03-26T19:37:04.904Z",
            updatedAt: "2019-03-26T19:37:04.904Z",
            deletedAt: null
          },
          Offerings: []
        },
        Contract: {
          id: 1,
          name: "AssetToken",
          description: null,
          addressHash: "0xE41c26cac300C2b0824C5ACE8ce84AD1F9A9Ad7f",
          latestBlockN: 0,
          chainTransac: 1,
          version: "2.0.1",
          abi:
            '[{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_moduleType","type":"uint8"},{"name":"_moduleIndex","type":"uint8"}],"name":"removeModule","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_moduleAddress","type":"address"}],"name":"addModule","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint8"},{"name":"","type":"uint256"}],"name":"modules","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TRANSFER_VALIDATOR_TYPE","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_moduleType","type":"uint8"},{"name":"_moduleIndex","type":"uint256"}],"name":"getModuleByTypeAndIndex","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"owner","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"ForceTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"moduleType","type":"uint8"},{"indexed":false,"name":"moduleName","type":"bytes32"},{"indexed":false,"name":"moduleAddress","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"LogModuleAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"moduleType","type":"uint8"},{"indexed":false,"name":"moduleAddress","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"LogModuleRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"moduleIndex","type":"uint256"},{"indexed":false,"name":"moduleType","type":"uint8"},{"indexed":false,"name":"moduleAddress","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"LogModuleIndexUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[],"name":"MintFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_initialAmount","type":"uint256"},{"name":"_name","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_symbol","type":"string"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"}],"name":"changeName","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"string"}],"name":"changeSymbol","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"forceTransfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"canSend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_who","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]',
          createdAt: "2019-03-26T19:08:20.580Z",
          updatedAt: "2019-03-26T19:08:20.580Z",
          deletedAt: null
        },
        Modules: [],
        ProxyContract: {
          id: 1036,
          name: "ProxyToken",
          description: null,
          addressHash: "0xE41c26cac300C2b0824C5ACE8ce84AD1F9A9Ad7f",
          latestBlockNumber: 0,
          chainTransactionId: 502,
          version: "0.1.0",
          abi:
            '[{"constant":true,"inputs":[],"name":"proxyType","outputs":[{"name":"proxyTypeId","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"implementation","outputs":[{"name":"impl","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousOwner","type":"address"},{"indexed":false,"name":"newOwner","type":"address"}],"name":"ProxyOwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"constant":true,"inputs":[],"name":"proxyOwner","outputs":[{"name":"owner","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferProxyOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"implementation","type":"address"}],"name":"upgradeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"implementation","type":"address"},{"name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]',
          createdAt: "2019-07-15T15:32:57.728Z",
          updatedAt: "2019-07-15T15:32:57.728Z",
          deletedAt: null
        },
        ValidatorViolations: []
      }
    }
  ],
  StableHoldings: [
    {
      id: 84,
      portfolioId: 460,
      tokenId: 1,
      amountTokens: "5200000000000000000000",
      amountUsd: "0",
      returnsUsd: "0",
      incomeUsd: "0",
      cashUsd: "5200",
      createdAt: "2019-07-15T13:03:00.346Z",
      updatedAt: "2019-07-15T21:10:41.912Z",
      deletedAt: null,
      Token: {
        id: 1,
        symbol: "DAI",
        name: "Dai",
        launchDate: null,
        type: "Stable",
        assetId: null,
        decimalUnits: 18,
        investorCap: null,
        ownerWalletId: null,
        contractId: 4,
        totalSupply: null,
        status: "Active",
        isPaused: false,
        structure: "Currency",
        initialPriceUsd: null,
        marketCapUsd: null,
        tokenPriceUsd: null,
        publicViewable: true,
        permissions: null,
        offeringAmount: null,
        offeringDescription: null,
        proxyOwnerWalletId: null,
        proxyImplementationId: null,
        presentationJson: null,
        createdAt: "2019-03-26T19:37:03.912Z",
        updatedAt: "2019-03-26T19:37:03.912Z",
        deletedAt: null,
        WalletHoldings: [
          {
            id: 89,
            walletId: 31,
            tokenId: 1,
            amountTokens: "5200000000000000000000",
            amountUsd: "5200",
            returnsUsd: "0",
            incomeUsd: "0",
            cashUsd: "5200",
            createdAt: "2019-07-15T13:03:00.330Z",
            updatedAt: "2019-07-15T21:10:41.902Z",
            deletedAt: null,
            Wallet: {
              id: 31,
              userId: "8c8344a0-a6e7-11e9-8689-9f36c8bfea8b",
              type: "ETH",
              displayName: "Amy Johnson Wallet 1",
              displayDescription: null,
              addressHash: "0xcbaac343dffa7a5dad16f57b7d8625fb0eb0e8a4",
              amountWei: "0",
              amountUsd: "0",
              default: true,
              signingType: "metamask",
              lastBlock: 4737729,
              createdAt: "2019-07-15T13:00:35.614Z",
              updatedAt: "2019-07-15T13:03:00.361Z",
              deletedAt: null
            }
          }
        ],
        Asset: null,
        Contract: {
          id: 4,
          name: "DaiToken",
          description: "Mock DaiToken contract",
          addressHash: "0x1Ef5d2F80951c8C390e2d565d1759BFbF911E19D",
          latestBlockNumber: 0,
          chainTransactionId: 4,
          version: "2.0.1",
          abi:
            '[{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]',
          createdAt: "2019-03-26T19:37:03.884Z",
          updatedAt: "2019-03-26T19:37:03.884Z",
          deletedAt: null
        },
        SingletonContract: null,
        Modules: []
      }
    }
  ]
};

app.get("/interaction/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let foundInteraction = await Interaction.findOne({
      where: {
        id
      }
    });
    console.log("Found Interaction~~", foundInteraction);
    if (!foundInteraction) {
      return res
        .sendStatus(206)
        .json({ error: `Interaction with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundInteraction);
  } catch (e) {
    console.error("Error creating Interaction", e);
  }
});

app
  .listen(port, () => {
    console.log(`app listening on port ${port}`);
  })
  .on("error", err => {
    console.log("error on startup: ", err);
    process.exit();
  });

exports = module.exports = app;
