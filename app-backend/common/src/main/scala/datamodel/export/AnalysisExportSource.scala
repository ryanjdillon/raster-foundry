package com.rasterfoundry.common.datamodel.export

import com.rasterfoundry.common._
import com.azavea.maml.ast.Expression
import com.azavea.maml.ast.codec.tree._
import geotrellis.vector.MultiPolygon
import geotrellis.proj4._
import cats.syntax.functor._
import _root_.io.circe._
import _root_.io.circe.syntax._
import _root_.io.circe.generic.semiauto._

case class AnalysisExportSource(
    zoom: Int,
    area: MultiPolygon,
    ast: Expression,
    params: Map[String, List[(String, Int, Option[Double])]]
) extends ExportSource

object AnalysisExportSource {
  implicit val encoder = deriveEncoder[AnalysisExportSource]
  implicit val decoder = deriveDecoder[AnalysisExportSource]
}
