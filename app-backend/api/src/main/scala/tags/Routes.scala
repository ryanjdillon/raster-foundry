package com.rasterfoundry.api.tooltag

import com.rasterfoundry.akkautil.{
  Authentication,
  CommonHandlers,
  UserErrorHandler
}
import com.rasterfoundry.database.ToolTagDao
import com.rasterfoundry.common.datamodel._
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import com.lonelyplanet.akka.http.extensions.PaginationDirectives
import de.heikoseeberger.akkahttpcirce.ErrorAccumulatingCirceSupport._

import java.util.UUID

import cats.effect.IO
import com.rasterfoundry.database.filter.Filterables._
import doobie._
import doobie.implicits._

trait ToolTagRoutes
    extends Authentication
    with PaginationDirectives
    with CommonHandlers
    with UserErrorHandler {
  val xa: Transactor[IO]

  val toolTagRoutes: Route = handleExceptions(userExceptionHandler) {
    pathEndOrSingleSlash {
      get { listToolTags } ~
        post { createToolTag }
    } ~
      pathPrefix(JavaUUID) { toolTagId =>
        pathEndOrSingleSlash {
          get { getToolTag(toolTagId) } ~
            put { updateToolTag(toolTagId) } ~
            delete { deleteToolTag(toolTagId) }
        }
      }
  }

  def listToolTags: Route = authenticate { user =>
    (withPagination) { (page) =>
      complete {
        ToolTagDao.query
          .filter(user)
          .page(page)
          .transact(xa)
          .unsafeToFuture()
      }
    }
  }

  def createToolTag: Route = authenticate { user =>
    entity(as[ToolTag.Create]) { newToolTag =>
      onSuccess(
        ToolTagDao.insert(newToolTag, user).transact(xa).unsafeToFuture()) {
        toolTag =>
          complete(StatusCodes.Created, toolTag)
      }
    }
  }

  def getToolTag(toolTagId: UUID): Route = authenticate { user =>
    authorizeAsync {
      ToolTagDao.query
        .ownedBy(user, toolTagId)
        .exists
        .transact(xa)
        .unsafeToFuture
    } {
      rejectEmptyResponse {
        complete(
          ToolTagDao.query.filter(toolTagId).select.transact(xa).unsafeToFuture)
      }
    }
  }

  def updateToolTag(toolTagId: UUID): Route = authenticate { user =>
    authorizeAsync {
      ToolTagDao.query
        .ownedBy(user, toolTagId)
        .exists
        .transact(xa)
        .unsafeToFuture
    } {
      entity(as[ToolTag]) { updatedToolTag =>
        onSuccess(
          ToolTagDao
            .update(updatedToolTag, toolTagId, user)
            .transact(xa)
            .unsafeToFuture()) {
          completeSingleOrNotFound
        }
      }
    }
  }

  def deleteToolTag(toolTagId: UUID): Route = authenticate { user =>
    authorizeAsync {
      ToolTagDao.query
        .ownedBy(user, toolTagId)
        .exists
        .transact(xa)
        .unsafeToFuture
    } {
      onSuccess(
        ToolTagDao.query
          .filter(toolTagId)
          .delete
          .transact(xa)
          .unsafeToFuture()) {
        completeSingleOrNotFound
      }
    }
  }

}
