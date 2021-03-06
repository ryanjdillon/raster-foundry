package com.rasterfoundry.database

import com.rasterfoundry.common.datamodel._
import com.rasterfoundry.common.datamodel.Generators.Implicits._
import com.rasterfoundry.database.Implicits._

import cats.implicits._
import doobie.implicits._
import org.scalacheck.Prop.forAll
import org.scalatest._
import org.scalatest.prop.Checkers

class ToolDaoSpec
    extends FunSuite
    with Matchers
    with Checkers
    with DBTestConfig
    with PropTestHelpers {
  test("selection types") {
    xa.use(t => ToolDao.query.list.transact(t))
      .unsafeRunSync
      .length should be >= 0
  }

  test("list tools") {
    check {
      forAll {
        (userCreate: User.Create,
         orgCreate: Organization.Create,
         toolCreates: List[Tool.Create]) =>
          {
            val toolListIO = for {
              (_, dbUser) <- insertUserAndOrg(userCreate, orgCreate)
              dbTools <- toolCreates traverse { toolCreate =>
                ToolDao.insert(toolCreate, dbUser)
              }
              listed <- ToolDao
                .authQuery(dbUser,
                           ObjectType.Template,
                           ownershipTypeO = Some("owned"))
                .list
            } yield (dbTools, listed)

            val (inserted, listed) =
              xa.use(t => toolListIO.transact(t)).unsafeRunSync

            assert(toolCreates.length == inserted.length,
                   "all of the tools were inserted into the db")
            assert(inserted.length == listed.length,
                   "counts of inserted and listed tools match")
            assert(Set(toolCreates map { _.title }) == Set(listed map {
              _.title
            }), "titles of listed tools are the same as the Tool.Creates")
            true
          }
      }
    }
  }

  test("update a tool") {
    check {
      forAll {
        (userCreate: User.Create,
         orgCreate: Organization.Create,
         toolCreate1: Tool.Create,
         toolCreate2: Tool.Create) =>
          {
            val updateIO = for {
              (_, dbUser) <- insertUserAndOrg(userCreate, orgCreate)
              dbTool1 <- ToolDao.insert(toolCreate1, dbUser)
              dbTool2 <- ToolDao.insert(toolCreate1, dbUser)
              _ <- ToolDao.update(dbTool2, dbTool1.id, dbUser)
              fetched <- ToolDao.query.filter(dbTool1.id).select
            } yield (dbTool2, fetched)

            val (updateTool, fetched) =
              xa.use(t => updateIO.transact(t)).unsafeRunSync
            assert(
              fetched.title == updateTool.title,
              "Title of fetched tool should be the title of the udpate tool")
            assert(
              fetched.description == updateTool.description,
              "Description of fetched tool should be the description of the udpate tool")
            assert(
              fetched.requirements == updateTool.requirements,
              "Requirements of fetched tool should be the requirements of the udpate tool")
            assert(
              fetched.visibility == updateTool.visibility,
              "Visibility of fetched tool should be the visibility of the udpate tool")
            assert(
              fetched.compatibleDataSources == updateTool.compatibleDataSources,
              "CompatibleDataSources of fetched tool should be the compatibleDataSources of the udpate tool"
            )
            assert(
              fetched.stars == updateTool.stars,
              "Stars of fetched tool should be the stars of the udpate tool")
            assert(
              fetched.singleSource == updateTool.singleSource,
              "SingleSource of fetched tool should be the singleSource of the udpate tool")
            true
          }
      }
    }
  }
}
